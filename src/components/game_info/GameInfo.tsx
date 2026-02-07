import { useCallback, useLayoutEffect, useRef, useState } from "react";
import Button from "../button/Button";
import NewGameModal from "../new_game_modal/NewGameModal";
import GameOver from "../game_over/GameOver";
import { FlagSvg, HandshakeSvg } from "../svgs/Svgs";
import { useGameStore } from "../../store/store";
import { GameMode } from "../../types.d";
import { twJoin } from "tailwind-merge";
import ScrollView from "../scroll_view/ScrollView";

function GameInfo()
{
    const { game, resign } = useGameStore();
    const [newGameModalOpen, setNewGameModalOpen] = useState(false);
    const moveListRef = useRef<HTMLDivElement>(null);

    const openNewGameModal = useCallback(() => 
    {
        setNewGameModalOpen(true);
    }, []);

    const closeNewGameModal = useCallback(() => 
    {
        setNewGameModalOpen(false);
    }, []);

    useLayoutEffect(() => 
    {
        if (!moveListRef.current) return;
        moveListRef.current.scrollTo({ top: moveListRef.current.scrollHeight, behavior: "smooth" });
    }, [game.turn]);

    const topPlayer = {
        name: game.mode === GameMode.HumanVsAI 
            ? game.playingAs === "w"
                ? game.players.black.model?.name
                : game.players.white.model?.name
            : game.players.black.model?.name,
        color: game.mode === GameMode.HumanVsAI 
            ? game.playingAs === "w"
                ? "b"
                : "w"
            : "b"            
    };

    const bottomPlayer = {
        name: game.mode === GameMode.HumanVsAI 
            ? "You"
            : game.players.white.model?.name,
        color: game.mode === GameMode.HumanVsAI
            ? game.playingAs === "w"
                ? "w"
                : "b"
            : "w"
    };

    return (
        <div className="w-72 shrink-0 h-full">
            <div className="relative rounded-md bg-neutral-700 overflow-hidden">
                <div className="h-10 px-3 flex items-center gap-2 border-b border-white/10">
                    <div className="w-5 h-5 p-0.5 rounded-full border-2 border-neutral-500">
                        {
                            game.turn === topPlayer.color && (
                                <div className="w-full h-full bg-green-600 rounded-full" />
                            )
                        }
                    </div>
                    <span className="text-sm font-medium">
                        { topPlayer.name }
                    </span>
                </div>
                <div className="h-10 px-3 flex items-center gap-2 border-b border-white/10">
                    <span className="flex-1 text-sm font-italic animate-pulse text-neutral-400 italic">
                        {
                            game.turn === topPlayer.color && (
                                "Thinking..."
                            )
                        }
                    </span>
                </div>

                <div className="h-50 flex">
                    <ScrollView className="p-0" viewRef={moveListRef}>
                        <div className="grid grid-cols-[2.5rem_1fr_1fr] gap-0 text-xs">
                            {
                                Array.from({ length: Math.ceil(game.history.length / 2) }, (_, index) => 
                                {
                                    const moveNumber = index + 1;
                                    const whiteMove = game.history[index * 2];
                                    const blackMove = game.history[index * 2 + 1];
                                    const isEvenRow = index % 2 === 0;
                                    
                                    return [
                                        <div 
                                            key={`${index}-number`}
                                            className={twJoin(
                                                "h-8 flex items-center justify-center",
                                                isEvenRow ? "bg-white/5" : "bg-transparent"
                                            )}
                                        >
                                            <span className="font-bold text-neutral-400">
                                                {moveNumber}.
                                            </span>
                                        </div>,
                                        
                                        <div 
                                            key={`${index}-white`}
                                            className={twJoin(
                                                "h-8 flex items-center justify-center px-2",
                                                isEvenRow ? "bg-white/5" : "bg-transparent"
                                            )}
                                        >
                                            <span className="font-medium">
                                                {whiteMove || ''}
                                            </span>
                                        </div>,
                                        
                                        <div 
                                            key={`${index}-black`}
                                            className={twJoin(
                                                "h-8 flex items-center justify-center px-2",
                                                isEvenRow ? "bg-white/5" : "bg-transparent"
                                            )}
                                        >
                                            <span className="font-medium">
                                                {blackMove || ''}
                                            </span>
                                        </div>
                                    ];
                                }).flat()
                            }
                        </div>
                    </ScrollView>
                </div>

                <div className="h-10 px-3 flex items-center gap-2 border-t border-white/10">
                    <span className="flex-1 text-sm font-italic animate-pulse text-neutral-400 italic">
                        {
                            game.turn === bottomPlayer.color 
                                ? game.mode === GameMode.HumanVsAI
                                    ? "Your move..."
                                    : "Thinking..."
                                : ""
                        }
                    </span>
                    <div className="flex items-center gap-2">
                        {
                            game.mode === GameMode.HumanVsAI 
                            ? (
                                <>
                                    <Button onlyIcon onClick={() => resign(game.playingAs)}>
                                        <FlagSvg className="w-5 h-5" />
                                    </Button>
                                    <Button onlyIcon disabled>
                                        <HandshakeSvg className="w-5 h-5" />
                                    </Button>
                                </>
                            )
                            : null
                        }
                    </div>
                </div>
                <div className="h-10 px-3 flex items-center gap-2 border-t border-white/10">
                    <div className="w-5 h-5 p-0.5 rounded-full border-2 border-neutral-500">
                        {
                            game.turn === bottomPlayer.color && (
                                <div className="w-full h-full bg-green-600 rounded-full" />
                            )
                        }
                    </div>
                    <span className="text-sm font-medium">
                        { bottomPlayer.name }
                    </span>
                </div>
                {
                    !game.playing && (
                        game.result ? (
                            <GameOver
                                result={game.result}
                                players={game.players}
                                mode={game.mode}
                                playingAs={game.playingAs}
                                onNewGame={openNewGameModal}
                                onClose={() => {}}
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-neutral-700">
                                <Button theme="blue" type="large" onClick={openNewGameModal}>
                                    Start New Game
                                </Button>
                            </div>
                        )
                    )
                }
            </div>
            <NewGameModal open={newGameModalOpen} onClose={closeNewGameModal} />
        </div>
    );
}

export default GameInfo;