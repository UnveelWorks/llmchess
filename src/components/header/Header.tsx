import Container from "../container/Container";
import IconButton from "../icon_button/IconButton";
import { GithubSvg, KeySvg } from "../svgs/Svgs";

function Header()
{
    return (
        <header className="h-16 shrink-0">
            <Container className="h-full flex-row items-center">
                <nav className="flex flex-1 items-center gap-2">
                    <div className="flex-1 flex items-center">
                        <h1 className="text-2xl font-bold">LLMChess</h1>
                    </div>
                    <ul className="flex flex-1 items-center justify-end gap-2">
                        <li>
                            <IconButton type="medium">
                                <KeySvg className="w-5 h-5" />
                                API Keys
                            </IconButton>
                        </li>
                        <li>
                            <a href="">
                                <IconButton type="medium" onlyIcon>
                                    <GithubSvg className="w-5 h-5" />
                                </IconButton>
                            </a>
                        </li>
                    </ul>
                </nav>
            </Container>
        </header>
    )
}

export default Header;