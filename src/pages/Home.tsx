import Board from "../components/board/Board";
import PlayerPanel from "../components/player_panel/PlayerPanel";
import MoveHistory from "../components/move_history/MoveHistory";
import GameOver from "../components/game_over/GameOver";
import NewGameModal from "../components/new_game_modal/NewGameModal";
import Sidebar from "../components/sidebar/Sidebar";
import BottomDrawer from "../components/bottom_drawer/BottomDrawer";
import Button from "../components/button/Button";
import Modal, { ModalContent, ModalFooter, ModalHeader } from "../components/modal/Modal";
import { FlagSvg, HandshakeSvg, PauseSvg, PlaySvg } from "../components/svgs/Svgs";
import { getFen, getLegalMoves, isLegalMove, useSettingsStore, useGameStore } from "../store/store";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GameMode } from "../types.d";
import type { NAISDK } from "../helpers/aisdk";
import AISDK from "../helpers/aisdk";
import Prompts from "../data/prompts";
import { tryCatch } from "../helpers/tryCatch";
import toast from "react-hot-toast";
import type { Color } from "chess.js";
import { getCapturedPieces, getMaterialAdvantage } from "../helpers/utils";

function Home()
{
    const { game, movePiece, resign, addAiStats, viewBoard, setPaused, setDrawOffered, drawAgreement } = useGameStore();
    const { apiKeys, prompts, retries } = useSettingsStore();
    const lastTurn = useRef<Color>("w");
    const wasPlaying = useRef(false);
    const abortControllerRef = useRef<AbortController | null>(null);
    const generationIdRef = useRef(0);
    const [newGameModalOpen, setNewGameModalOpen] = useState(false);
    const [resignConfirmOpen, setResignConfirmOpen] = useState(false);
    const [gameOverDismissed, setGameOverDismissed] = useState(false);

    const isAiMove = useCallback(() =>
    {
        let isAiMove = false, model: NAISDK.Model | null = null;
        if (game.mode === GameMode.HumanVsAI && game.turn !== game.playingAs)
        {
            isAiMove = true;
            model = game.playingAs === "w" ? game.players.black.model! : game.players.white.model!;
        }
        else if (game.mode === GameMode.AIVsAI)
        {
            isAiMove = true;
            model = game.turn === "w" ? game.players.white.model! : game.players.black.model!;
        }

        return { status: isAiMove, model };
    },
    [game.mode, game.turn, game.playingAs, game.players]);

    const abortCurrentGeneration = useCallback(() => {
        generationIdRef.current += 1;
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
    }, []);

    const getAiMove = useCallback(async (model: NAISDK.Model) =>
    {
        if (!game.playing) return;

        const currentGenerationId = generationIdRef.current;
        const controller = new AbortController();
        abortControllerRef.current = controller;

        const ai = new AISDK(apiKeys);
        const fen = getFen();
        const turn = game.turn === "w" ? "white" : "black";
        let systemPrompt = Prompts.generatePrompt(
            prompts.moveGeneration,
            { FEN: fen, TURN: turn }
        );

        if (game.drawOffered) {
            systemPrompt += "\n\nIMPORTANT: Your opponent has offered a draw. If you believe the position is equal or you are willing to accept, set offerDraw to true in your make_move call to accept the draw. If you decline, set offerDraw to false and play your best move.";
        }

        console.log(`${game.turn === "w" ? "White" : "Black"}'s Turn: ${model.name}`);
        console.log("Generating move...");

        const { data: result, error } = await tryCatch(
            ai.generateAgenticMove(model, systemPrompt, fen, turn, getLegalMoves, isLegalMove, retries, controller.signal)
        );

        // Stale generation or aborted — a new game or pause cancelled this one
        if (currentGenerationId !== generationIdRef.current || controller.signal.aborted) {
            console.log("Move generation aborted");
            return;
        }

        // Re-check live state after async — game may have ended or been paused during the API call
        const currentState = useGameStore.getState().game;
        if (!currentState.playing || currentState.paused) return;

        if (error)
        {
            console.log("Move generation failed:", error);
            toast.error("Move generation failed: " + error.message);
            resign(game.turn);
            return;
        }

        console.log("Move:", result.move, `(${result.tries} try/tries)`);

        if (result.resign) {
            resign(game.turn);
            return;
        }

        if (game.drawOffered && result.offerDraw) {
            toast("AI accepted the draw!", { icon: "🤝", duration: 3000 });
            drawAgreement();
            return;
        }

        if (game.drawOffered) {
            setDrawOffered(false);
            toast("AI declined the draw offer", { icon: "❌", duration: 2000 });
        }

        // Final guard — check again before applying the move
        if (!useGameStore.getState().game.playing) return;

        const totalTokens = (result.usage.inputTokens || 0) + (result.usage.outputTokens || 0);
        addAiStats(game.turn, result.usage, result.tries);
        toast(`AI moved in ${result.tries} ${result.tries === 1 ? 'try' : 'tries'}, ${totalTokens.toLocaleString()} tokens`, { icon: "🧠", duration: 2000 });

        try {
            viewBoard(null);
            movePiece(result.move, {
                inputTokens: result.usage.inputTokens || 0,
                outputTokens: result.usage.outputTokens || 0,
                tries: result.tries,
            });
        } catch (err) {
            console.log("Failed to apply validated move:", err);
            toast.error("Failed to apply move — AI forfeits.");
            resign(game.turn);
        }
    },
    [apiKeys, prompts, retries, game.turn, game.playing, game.drawOffered, movePiece, resign, addAiStats, viewBoard, drawAgreement, setDrawOffered]);

    const move = useCallback((san: string) =>
    {
        try {
            movePiece(san);
        } catch {
            // Silent fail for invalid human drag-and-drop
        }
    },
    [movePiece]);

    const defaultTitle = "Play Chess with LLM or Let them Play Each Other | LLMChess";

    useEffect(() => {
        if (!game.playing) {
            document.title = defaultTitle;
            return;
        }
        if (game.mode === GameMode.HumanVsAI) {
            document.title = game.turn === game.playingAs
                ? "Your Turn | LLMChess"
                : "AI is Thinking... | LLMChess";
        } else {
            const name = game.turn === "w"
                ? game.players.white.model?.name || "White"
                : game.players.black.model?.name || "Black";
            document.title = `${name}'s Turn | LLMChess`;
        }
    }, [game.playing, game.turn, game.mode, game.playingAs, game.players]);

    useEffect(() => {
        return () => { document.title = defaultTitle; };
    }, []);

    useEffect(() => {
        if (game.paused || !game.playing) {
            abortCurrentGeneration();
            if (game.paused) {
                lastTurn.current = "" as Color; // force re-trigger on resume
            }
        }
    }, [game.paused, game.playing, abortCurrentGeneration]);

    useEffect(() =>
    {
        if (game.playing && !wasPlaying.current) {
            abortCurrentGeneration();
            lastTurn.current = "" as Color; // force mismatch on new game
            setGameOverDismissed(false);
        }
        wasPlaying.current = game.playing;
        if (!game.playing) return;
        if (lastTurn.current === game.turn) return;
        if (game.paused) return; // don't update lastTurn — will re-fire when unpaused
        const { status, model } = isAiMove();
        if (status) getAiMove(model!);
        lastTurn.current = game.turn;
    },
    [game.playing, game.turn, game.paused, getAiMove, isAiMove, abortCurrentGeneration]);

    const openNewGameModal = useCallback(() => setNewGameModalOpen(true), []);
    const closeNewGameModal = useCallback(() => setNewGameModalOpen(false), []);

    const topPlayer = useMemo(() => {
        if (game.mode === GameMode.HumanVsAI) {
            const isWhite = game.playingAs === "w";
            return {
                name: (isWhite ? game.players.black.model?.name : game.players.white.model?.name) || "AI",
                color: (isWhite ? "b" : "w") as Color,
            };
        }
        return {
            name: game.players.black.model?.name || "Black",
            color: "b" as Color,
        };
    }, [game.mode, game.playingAs, game.players]);

    const bottomPlayer = useMemo(() => {
        if (game.mode === GameMode.HumanVsAI) {
            return {
                name: "You",
                color: game.playingAs,
            };
        }
        return {
            name: game.players.white.model?.name || "White",
            color: "w" as Color,
        };
    }, [game.mode, game.playingAs, game.players]);

    const getStatusText = useCallback((playerColor: Color) => {
        if (!game.playing) return undefined;
        if (game.turn !== playerColor) return undefined;
        if (game.mode === GameMode.HumanVsAI && playerColor === game.playingAs) {
            return "Your move...";
        }
        return "Thinking...";
    }, [game.playing, game.turn, game.mode, game.playingAs]);

    const captured = useMemo(() => getCapturedPieces(game.board), [game.board]);

    const materialAdv = useMemo(() => getMaterialAdvantage(game.board), [game.board]);

    const formatTokens = useCallback((tokens: number) => {
        if (tokens === 0) return null;
        if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}k tokens`;
        return `${tokens} tokens`;
    }, []);

    const topTokenInfo = useMemo(() => {
        const stats = game.aiStats[topPlayer.color === "w" ? "white" : "black"];
        return formatTokens(stats.inputTokens + stats.outputTokens);
    }, [game.aiStats, topPlayer.color, formatTokens]);

    const bottomTokenInfo = useMemo(() => {
        const stats = game.aiStats[bottomPlayer.color === "w" ? "white" : "black"];
        return formatTokens(stats.inputTokens + stats.outputTokens);
    }, [game.aiStats, bottomPlayer.color, formatTokens]);

    const onMoveClick = useCallback((index: number) => {
        viewBoard(index);
    }, [viewBoard]);

    const isHumanVsAI = game.mode === GameMode.HumanVsAI;
    const isAIVsAI = game.mode === GameMode.AIVsAI;

    const handleDrawOffer = useCallback(() => {
        if (!game.playing || game.turn !== game.playingAs) return;
        setDrawOffered(true);
        toast("Draw offered to AI", { icon: "🤝", duration: 2000 });
    }, [game.playing, game.turn, game.playingAs, setDrawOffered]);

    const drawDisabled = game.turn !== game.playingAs || game.drawOffered;

    const resignDrawActions = game.playing && isHumanVsAI ? (
        <>
            <Button onlyIcon onClick={() => { setPaused(true); setResignConfirmOpen(true); }} className="text-neutral-400 hover:text-red-400">
                <FlagSvg className="w-4 h-4" />
            </Button>
            <Button onlyIcon disabled={drawDisabled} onClick={handleDrawOffer} className={game.drawOffered ? "text-blue-400" : "text-neutral-400 hover:text-blue-400"}>
                <HandshakeSvg className="w-4 h-4" />
            </Button>
        </>
    ) : null;

    const sidebarHeader = (!game.playing || isAIVsAI) ? (
        <Button theme={!game.playing ? "blue" : undefined} type="base" onClick={openNewGameModal}>
            New Game
        </Button>
    ) : null;

    const sidebarFooter = (() => {
        if (game.playing && isHumanVsAI) {
            return (
                <>
                    <Button onlyIcon onClick={() => { setPaused(true); setResignConfirmOpen(true); }} className="text-neutral-400 hover:text-red-400">
                        <FlagSvg className="w-4 h-4" />
                    </Button>
                    <Button onlyIcon disabled={drawDisabled} onClick={handleDrawOffer} className={game.drawOffered ? "text-blue-400" : "text-neutral-400 hover:text-blue-400"}>
                        <HandshakeSvg className="w-4 h-4" />
                    </Button>
                </>
            );
        }
        if (game.playing && isAIVsAI) {
            return (
                <Button onlyIcon onClick={() => setPaused(!game.paused)} className="text-neutral-400 hover:text-white">
                    {game.paused ? <PlaySvg className="w-4 h-4" /> : <PauseSvg className="w-4 h-4" />}
                </Button>
            );
        }
        return null;
    })();

    return (
        <section className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 flex flex-col lg:flex-row items-center lg:justify-center gap-0 lg:gap-6 px-2 py-0 lg:p-4 min-h-0">
                {/* Board column */}
                <div className="flex flex-col items-center shrink-0">
                    <PlayerPanel
                        name={topPlayer.name}
                        color={topPlayer.color}
                        isActive={game.turn === topPlayer.color}
                        statusText={getStatusText(topPlayer.color)}
                        capturedPieces={topPlayer.color === "w" ? captured.white : captured.black}
                        tokenInfo={topTokenInfo || undefined}
                        materialAdvantage={topPlayer.color === "w" ? materialAdv.white : materialAdv.black}
                    />
                    <div className="board-sizing relative">
                        <Board move={move} />
                        {/* Mobile-only "New Game" overlay when not playing */}
                        {!game.playing && !game.result && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-lg lg:hidden z-10">
                                <Button theme="blue" type="large" onClick={openNewGameModal}>
                                    New Game
                                </Button>
                            </div>
                        )}
                    </div>
                    <PlayerPanel
                        name={bottomPlayer.name}
                        color={bottomPlayer.color}
                        isActive={game.turn === bottomPlayer.color}
                        statusText={getStatusText(bottomPlayer.color)}
                        capturedPieces={bottomPlayer.color === "w" ? captured.white : captured.black}
                        actions={resignDrawActions}
                        tokenInfo={bottomTokenInfo || undefined}
                        materialAdvantage={bottomPlayer.color === "w" ? materialAdv.white : materialAdv.black}
                    />
                </div>

                {/* Desktop sidebar */}
                <Sidebar
                    history={game.history}
                    turn={game.turn}
                    playing={game.playing}
                    header={sidebarHeader}
                    footer={sidebarFooter}
                    onMoveClick={onMoveClick}
                    viewingMoveIndex={game.viewingMoveIndex}
                    moveStats={game.moveStats}
                />
            </div>

            {/* Mobile bottom drawer */}
            <BottomDrawer>
                <MoveHistory history={game.history} turn={game.turn} onMoveClick={onMoveClick} viewingMoveIndex={game.viewingMoveIndex} moveStats={game.moveStats} />
                {game.playing && isHumanVsAI && (
                    <div className="flex items-center justify-center gap-3 py-3 border-t border-white/[0.06]">
                        <Button onClick={() => { setPaused(true); setResignConfirmOpen(true); }} className="text-neutral-400 hover:text-red-400">
                            <FlagSvg className="w-4 h-4" />
                            <span className="text-sm">Resign</span>
                        </Button>
                        <Button disabled={drawDisabled} onClick={handleDrawOffer} className={game.drawOffered ? "text-blue-400" : "text-neutral-400 hover:text-blue-400"}>
                            <HandshakeSvg className="w-4 h-4" />
                            <span className="text-sm">{game.drawOffered ? "Draw Offered" : "Draw"}</span>
                        </Button>
                    </div>
                )}
                {game.playing && isAIVsAI && (
                    <div className="flex items-center justify-center gap-3 py-3 border-t border-white/[0.06]">
                        <Button onClick={() => setPaused(!game.paused)} className="text-neutral-400 hover:text-white">
                            {game.paused ? <PlaySvg className="w-4 h-4" /> : <PauseSvg className="w-4 h-4" />}
                            <span className="text-sm">{game.paused ? "Resume" : "Pause"}</span>
                        </Button>
                        <Button onClick={openNewGameModal} className="text-neutral-400 hover:text-white">
                            <span className="text-sm">New Game</span>
                        </Button>
                    </div>
                )}
                {!game.playing && (
                    <div className="flex items-center justify-center py-3">
                        <Button theme="blue" type="medium" onClick={openNewGameModal}>
                            New Game
                        </Button>
                    </div>
                )}
            </BottomDrawer>

            {/* Game Over overlay */}
            {!game.playing && game.result && !gameOverDismissed && (
                <GameOver
                    result={game.result}
                    players={game.players}
                    mode={game.mode}
                    playingAs={game.playingAs}
                    onNewGame={openNewGameModal}
                    onClose={() => setGameOverDismissed(true)}
                />
            )}

            {/* Viewing mode banner */}
            {game.viewingMoveIndex !== null && (
                <div
                    className="fixed top-16 left-1/2 -translate-x-1/2 z-40 bg-amber-500/90 text-black text-sm font-medium px-4 py-2 rounded-full cursor-pointer shadow-lg backdrop-blur-sm"
                    onClick={() => viewBoard(null)}
                >
                    Viewing move {game.viewingMoveIndex + 1} — Click to return to game
                </div>
            )}

            {/* Resign confirmation */}
            <Modal open={resignConfirmOpen}>
                <ModalHeader title="Resign?" onClose={() => { setPaused(false); setResignConfirmOpen(false); }} />
                <ModalContent>
                    <p className="text-sm text-neutral-400">Are you sure you want to resign this game?</p>
                </ModalContent>
                <ModalFooter>
                    <Button type="medium" onClick={() => { setPaused(false); setResignConfirmOpen(false); }}>Cancel</Button>
                    <Button theme="red" type="medium" onClick={() => { resign(game.playingAs); setResignConfirmOpen(false); }}>Resign</Button>
                </ModalFooter>
            </Modal>

            <NewGameModal open={newGameModalOpen} onClose={closeNewGameModal} />
        </section>
    )
}

export default Home;
