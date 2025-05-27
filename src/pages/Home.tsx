import Container from "../components/container/Container";
import Board from "../components/board/Board";
import { StopSvg } from "../components/svgs/Svgs";
import IconButton from "../components/icon_button/IconButton";
import { GameProvider } from "../context/GameProvider";

function Home()
{
    return (
        <GameProvider>
            <section className="py-6 flex-1 flex flex-col min-h-0 overflow-hidden">
                <Container className="flex-1 flex flex-row justify-center gap-2 min-h-0 overflow-hidden">
                    <div className="w-72 shrink-0">
                        <div className="rounded-md bg-neutral-700">

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
                                    <IconButton onlyIcon>
                                        <StopSvg className="w-5 h-5" />
                                    </IconButton>
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
                        </div>
                    </div>

                    <div className="flex flex-col items-start justify-start min-h-0 overflow-hidden">
                        <Board />
                    </div>
                </Container>
            </section>
        </GameProvider>
    )
}

export default Home;