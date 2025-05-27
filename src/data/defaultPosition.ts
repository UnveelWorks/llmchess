import type { BoardPosition } from "../types";

const defaultPosition: { white: BoardPosition; black: BoardPosition } = {
    white: [
        "r", "n", "b", "q", "k", "b", "n", "r",
        "p", "p", "p", "p", "p", "p", "p", "p",
        "", "", "", "", "", "", "", "",
        "", "", "", "", "", "", "", "",
        "", "", "", "", "", "", "", "",
        "", "", "", "", "", "", "", "",
        "P", "P", "P", "P", "P", "P", "P", "P",
        "R", "N", "B", "Q", "K", "B", "N", "R"
    ],
    black: [
        "R", "N", "B", "K", "Q", "B", "N", "R",
        "P", "P", "P", "P", "P", "P", "P", "P",
        "", "", "", "", "", "", "", "",
        "", "", "", "", "", "", "", "",
        "", "", "", "", "", "", "", "",
        "", "", "", "", "", "", "", "",
        "p", "p", "p", "p", "p", "p", "p", "p",
        "r", "n", "b", "k", "q", "b", "n", "r"
    ]
}

export default defaultPosition;