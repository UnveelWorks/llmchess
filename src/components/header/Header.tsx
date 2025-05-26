import Container from "../container/Container";

function Header()
{
    return (
        <header className="h-16">
            <Container className="h-full flex-row items-center">
                <h1>LLMChess</h1>
            </Container>
        </header>
    )
}

export default Header;