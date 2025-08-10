import { useCallback, useState } from "react";
import Button from "../button/Button";
import NewGameModal from "../new_game_modal/NewGameModal";
import { FlagSvg, HandshakeSvg, StopSvg } from "../svgs/Svgs";
import { useGameStore } from "../../store/store";
import { GameMode, PlayerType } from "../../types.d";

function GameInfo()
{
    const { game } = useGameStore();
    const [newGameModalOpen, setNewGameModalOpen] = useState(false);

    const openNewGameModal = useCallback(() => 
    {
        setNewGameModalOpen(true);
    }, []);

    const closeNewGameModal = useCallback(() => 
    {
        setNewGameModalOpen(false);
    }, []);

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
        <div className="w-72 shrink-0">
            <div className="relative rounded-md bg-neutral-700 overflow-hidden">
                <div className="h-10 px-3 flex items-center gap-2 border-b border-white/5">
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
                <div className="h-10 px-3 flex items-center gap-2 border-b border-white/5">
                    <span className="flex-1 text-sm font-italic animate-pulse text-neutral-400 italic">
                        {
                            game.turn === topPlayer.color && (
                                "Thinking..."
                            )
                        }
                    </span>
                    <div className="flex items-center gap-2">
                        <Button onlyIcon>
                            <StopSvg className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                <div className="h-50 overflow-y-auto">

                </div>

                <div className="h-10 px-3 flex items-center gap-2 border-t border-white/5">
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
                                    <Button onlyIcon>
                                        <FlagSvg className="w-5 h-5" />
                                    </Button>
                                    <Button onlyIcon>
                                        <HandshakeSvg className="w-5 h-5" />
                                    </Button>
                                </>
                            )
                            : (
                                <Button onlyIcon>
                                    <StopSvg className="w-5 h-5" />
                                </Button>
                            )
                        }
                    </div>
                </div>
                <div className="h-10 px-3 flex items-center gap-2 border-t border-white/5">
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
                        <div className="absolute inset-0 flex items-center justify-center bg-neutral-700">
                            <Button theme="blue" type="large" onClick={openNewGameModal}>
                                Start New Game
                            </Button>
                        </div>
                    )
                }
            </div>
            <NewGameModal open={newGameModalOpen} onClose={closeNewGameModal} />
        </div>
    );
}

export default GameInfo;