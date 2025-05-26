import Container from "../components/container/Container";
import Board from "../components/board/Board";

function Home()
{
    return (
        <div className="flex-1 flex flex-col">
            <Container className="flex-1 flex-row">
                <div className="w-88">
                </div>
                <div className="flex-1 flex flex-col">
                    <Board />
                </div>
            </Container>
        </div>
    )
}

export default Home;