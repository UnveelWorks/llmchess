import type { Color } from "chess.js";
import type { Tile } from "../types.d";

const squares = [
    "a8", "b8", "c8", "d8", "e8", "f8", "g8", "h8",
    "a7", "b7", "c7", "d7", "e7", "f7", "g7", "h7",
    "a6", "b6", "c6", "d6", "e6", "f6", "g6", "h6",
    "a5", "b5", "c5", "d5", "e5", "f5", "g5", "h5",
    "a4", "b4", "c4", "d4", "e4", "f4", "g4", "h4",
    "a3", "b3", "c3", "d3", "e3", "f3", "g3", "h3",
    "a2", "b2", "c2", "d2", "e2", "f2", "g2", "h2",
    "a1", "b1", "c1", "d1", "e1", "f1", "g1", "h1",
];

function getSquare(row: number, col: number, playingAs: Color)
{
    return playingAs === "w" ? squares[row * 8 + col] : squares[63 - (row * 8 + col)];
}

const startingPieces: Record<string, number> = {
    p: 8, n: 2, b: 2, r: 2, q: 1, k: 1
};

export function getCapturedPieces(board: (Tile | null)[][]): { white: string[]; black: string[] } {
    const current: Record<string, Record<string, number>> = {
        w: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
        b: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
    };

    for (const row of board) {
        for (const tile of row) {
            if (tile) {
                current[tile.color][tile.type]++;
            }
        }
    }

    const white: string[] = [];
    const black: string[] = [];

    for (const piece of ["q", "r", "b", "n", "p"]) {
        const wCaptured = startingPieces[piece] - current["w"][piece];
        const bCaptured = startingPieces[piece] - current["b"][piece];
        for (let i = 0; i < wCaptured; i++) white.push(`w${piece}`);
        for (let i = 0; i < bCaptured; i++) black.push(`b${piece}`);
    }

    return { white, black };
}

const pieceValues: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

export function getMaterialAdvantage(board: (Tile | null)[][]): { white: number; black: number } {
    let w = 0, b = 0;
    for (const row of board)
        for (const tile of row)
            if (tile) { const v = pieceValues[tile.type]; if (tile.color === 'w') w += v; else b += v; }
    return { white: w - b, black: b - w };
}

const Utils = {
    getSquare
}

export default Utils;