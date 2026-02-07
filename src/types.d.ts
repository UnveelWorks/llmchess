import type { NAISDK } from "./helpers/aisdk";
import type { Square, Color, PieceSymbol, Move } from "chess.js";

export interface Tile {
	square: Square; 
	type: PieceSymbol; 
	color: Color;
}

export interface AiColorStats {
    inputTokens: number;
    outputTokens: number;
    steps: number;
}

export interface MoveStats {
    inputTokens: number;
    outputTokens: number;
    steps: number;
}

export interface Game {
    playing: boolean;
    paused: boolean;
    drawOffered: boolean;
    playingAs: Color;
    players: Players;
    mode: GameMode;
	board: (Tile | null)[][];
	turn: Color;
    lastMove: Move | null;
    result: GameResult | null;
    history: string[];
    moveStats: (MoveStats | null)[];
    aiStats: {
        white: AiColorStats;
        black: AiColorStats;
    };
    viewingMoveIndex: number | null;
    viewingBoard: (Tile | null)[][] | null;
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
    DrawAgreement = "draw_agreement",
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