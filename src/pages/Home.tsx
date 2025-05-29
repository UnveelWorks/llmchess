import Container from "../components/container/Container";
import Board from "../components/board/Board";
import { GameProvider } from "../context/GameProvider";
import GameInfo from "../components/game_info/GameInfo";
import NewGameModal from "../components/new_game_modal/NewGameModal";

function Home()
{
    return (
        <GameProvider>
            <section className="relative py-6 flex-1 flex flex-col min-h-0 overflow-hidden">
                <Container className="flex-1 flex flex-row justify-center gap-2 min-h-0 overflow-hidden">
                    <GameInfo />

                    <div className="flex flex-col items-start justify-start min-h-0 overflow-hidden">
                        <Board />
                    </div>
                </Container>
                <NewGameModal />
            </section>
        </GameProvider>
    )
}

export default Home;