import Board from "../components/board/Board";
import PlayerPanel from "../components/player_panel/PlayerPanel";
import MoveHistory from "../components/move_history/MoveHistory";
import GameOver from "../components/game_over/GameOver";
import NewGameModal from "../components/new_game_modal/NewGameModal";
import Sidebar from "../components/sidebar/Sidebar";
import BottomDrawer from "../components/bottom_drawer/BottomDrawer";
import Button from "../components/button/Button";
import { FlagSvg, HandshakeSvg } from "../components/svgs/Svgs";
import { getFen, useSettingsStore, useGameStore } from "../store/store";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GameMode } from "../types.d";
import type { NAISDK } from "../helpers/aisdk";
import AISDK from "../helpers/aisdk";
import Prompts from "../data/prompts";
import z from "zod";
import { tryCatch } from "../helpers/tryCatch";
import toast from "react-hot-toast";
import type { Color } from "chess.js";
import { getCapturedPieces } from "../helpers/utils";

const RESPONSE_SCHEMA = z.object({
    move: z.string(),
    offerDraw: z.boolean(),
    resign: z.boolean(),
});

function Home()
{
    const { game, movePiece, resign } = useGameStore();
    const { apiKeys, prompts, retries } = useSettingsStore();
    const lastTurn = useRef<Color>("w");
    const previousInvalidMoves = useRef<string[]>([]);
    const retriesRef = useRef(0);
    const [newGameModalOpen, setNewGameModalOpen] = useState(false);

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

    const networkRetriesRef = useRef(0);
    const MAX_NETWORK_RETRIES = 3;

    const getAiMove = useCallback(async (model: NAISDK.Model, retry: boolean = false) =>
    {
        if (!game.playing) return;
        const ai = new AISDK(apiKeys);
        const fen = getFen();
        const prompt = retry
            ? Prompts.generatePrompt(
                prompts.moveCorrection,
                {
                    FEN: fen,
                    TURN: game.turn === "w" ? "white" : "black",
                    PREVIOUS_INVALID_MOVES: JSON.stringify(previousInvalidMoves.current)
                }
            )
            : Prompts.generatePrompt(
                prompts.moveGeneration,
                {
                    FEN: fen,
                    TURN: game.turn === "w" ? "white" : "black"
                }
            );


        console.log(`${game.turn === "w" ? "White" : "Blacks"}'s Turn: ${model.name}`);
        console.log(retry ? "Correcting move..." : "Generating move...");

        const { data: response, error } = await tryCatch(ai.generateObject(
            model,
            prompt,
            RESPONSE_SCHEMA
        ));

        if (error)
        {
            if (networkRetriesRef.current < MAX_NETWORK_RETRIES)
            {
                networkRetriesRef.current++;
                console.log(`Network error, retrying (${networkRetriesRef.current}/${MAX_NETWORK_RETRIES})...`, error);
                toast.error(`Request failed, retrying (${networkRetriesRef.current}/${MAX_NETWORK_RETRIES})...`);
                getAiMove(model, retry);
                return;
            }
            networkRetriesRef.current = 0;
            toast.error("Move generation failed: " + error.message);
            console.log("Move generation failed: ", error);
            return;
        }

        networkRetriesRef.current = 0;
        console.log("Move: ", response.object);

        if (response.object.resign) {
            resign(game.turn);
            return;
        }

        move(response.object.move);
    },
    [apiKeys, prompts, game.turn, game.playing, getFen]);

    const move = useCallback((move: string) =>
    {
        const { status, model } = isAiMove();
        try
        {
            movePiece(move);
            if (status)
            {
                previousInvalidMoves.current = [];
                retriesRef.current = 0;
            }
        }
        catch (err: any)
        {
            if (!status) return;
            console.log(err);

            if (retriesRef.current >= retries)
            {

                return;
            }

            if (!previousInvalidMoves.current.includes(move)) previousInvalidMoves.current.push(move);
            retriesRef.current++;
            getAiMove(model!, true);
        }
    },
    [isAiMove]);

    useEffect(() =>
    {
        if (!game.playing && lastTurn.current === game.turn) return;
        const { status, model } = isAiMove();
        if (status) getAiMove(model!, false);
        lastTurn.current = game.turn;
    },
    [game.playing, game.turn, getAiMove, isAiMove]);

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

    const isHumanVsAI = game.mode === GameMode.HumanVsAI;

    const resignDrawActions = game.playing && isHumanVsAI ? (
        <>
            <Button onlyIcon onClick={() => resign(game.playingAs)} className="text-neutral-400 hover:text-red-400">
                <FlagSvg className="w-4 h-4" />
            </Button>
            <Button onlyIcon disabled className="text-neutral-400">
                <HandshakeSvg className="w-4 h-4" />
            </Button>
        </>
    ) : null;

    const sidebarHeader = !game.playing ? (
        <Button theme="blue" type="base" onClick={openNewGameModal}>
            New Game
        </Button>
    ) : null;

    const sidebarFooter = game.playing && isHumanVsAI ? (
        <>
            <Button onlyIcon onClick={() => resign(game.playingAs)} className="text-neutral-400 hover:text-red-400">
                <FlagSvg className="w-4 h-4" />
            </Button>
            <Button onlyIcon disabled className="text-neutral-400">
                <HandshakeSvg className="w-4 h-4" />
            </Button>
        </>
    ) : null;

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
                    />
                </div>

                {/* Desktop sidebar */}
                <Sidebar
                    history={game.history}
                    turn={game.turn}
                    playing={game.playing}
                    header={sidebarHeader}
                    footer={sidebarFooter}
                />
            </div>

            {/* Mobile bottom drawer */}
            <BottomDrawer>
                <MoveHistory history={game.history} turn={game.turn} />
                {game.playing && isHumanVsAI && (
                    <div className="flex items-center justify-center gap-3 py-3 border-t border-white/[0.06]">
                        <Button onClick={() => resign(game.playingAs)} className="text-neutral-400 hover:text-red-400">
                            <FlagSvg className="w-4 h-4" />
                            <span className="text-sm">Resign</span>
                        </Button>
                        <Button disabled className="text-neutral-400">
                            <HandshakeSvg className="w-4 h-4" />
                            <span className="text-sm">Draw</span>
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
            {!game.playing && game.result && (
                <GameOver
                    result={game.result}
                    players={game.players}
                    mode={game.mode}
                    playingAs={game.playingAs}
                    onNewGame={openNewGameModal}
                />
            )}

            <NewGameModal open={newGameModalOpen} onClose={closeNewGameModal} />
        </section>
    )
}

export default Home;
