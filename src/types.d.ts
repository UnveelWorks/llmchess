import type { NAISDK } from "./helpers/aisdk";
import type { Square, Color, PieceSymbol, Move } from "chess.js";

export interface Tile {
	square: Square; 
	type: PieceSymbol; 
	color: Color;
}

export interface Game {
    playing: boolean;
    playingAs: Color;
    players: Players;
    mode: GameMode;
	board: (Tile | null)[][];
	turn: Color;
    lastMove: Move | null;
    result: GameResult | null;
    history: string[];
}

export enum GameMode {
    HumanVsAI = "human_vs_ai",
    AIVsAI = "ai_vs_ai"
}

export enum PlayerType {
    Human = "human",
    AI = "ai"
}

export enum GameOverReason {
    Checkmate = "checkmate",
    Stalemate = "stalemate",
    InsufficientMaterial = "insufficient_material",
    ThreefoldRepetition = "threefold_repetition",
    FiftyMoveRule = "fifty_move_rule",
    Resignation = "resignation",
}

export interface GameResult {
    reason: GameOverReason;
    winner: Color | null;
}

export interface Players {
    white: {
        type: PlayerType;
        model?: NAISDK.Model;
    },
    black: {
        type: PlayerType;
        model?: NAISDK.Model;
    }
};