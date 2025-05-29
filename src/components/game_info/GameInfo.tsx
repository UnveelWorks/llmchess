import { useGame } from "../../context/GameProvider";
import Button from "../button/Button";
import { StopSvg } from "../svgs/Svgs";

function GameInfo()
{
    const { isPlaying, setNewGameModalOpen } = useGame();
    
    const handleNewGameOpen = () => 
    {
        setNewGameModalOpen(true);
    }
    
    return (
        <div className="w-72 shrink-0">
            <div className="relative rounded-md bg-neutral-700 overflow-hidden">
                <div className="h-10 px-3 flex items-center gap-2 border-b border-white/5">
                    <div 
                        className="w-5 h-5 rounded-full border-2 border-neutral-600"
                    />
                    <span className="text-sm font-medium">
                        Claude Sonnet 3.7
                    </span>
                </div>
                <div className="h-10 px-3 flex items-center gap-2 border-b border-white/5">
                    <span className="flex-1 text-sm font-italic animate-pulse text-neutral-400 italic">Thinking...</span>
                    <div className="flex items-center gap-2">
                        <Button onlyIcon>
                            <StopSvg className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                <div className="h-50 overflow-y-auto">

                </div>

                <div className="h-10 px-3 flex items-center gap-2 border-t border-white/5">
                    
                </div>
                <div className="h-10 px-3 flex items-center gap-2 border-t border-white/5">
                    <div className="w-5 h-5 rounded-full border-2 border-neutral-600"></div>
                    <span className="text-sm font-medium">
                        You
                    </span>
                </div>
                {
                    !isPlaying && (
                        <div className="absolute inset-0 flex items-center justify-center bg-neutral-700">
                            <Button theme="blue" type="large" onClick={handleNewGameOpen}>
                                Start New Game
                            </Button>
                        </div>
                    )
                }
            </div>
        </div>
    );
}

export default GameInfo;