import type { NAISDK } from "./helpers/aisdk";

export enum GameModes {
    HumanVsAi = "human_vs_ai",
    AiVsAi = "ai_vs_ai"
}

export enum PlayerType {
    Human = "human",
    Ai = "ai"
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

export type BoardPosition = string[];
export type PieceColor = "white" | "black";
export interface DraggedPiece {
    value: string;
    fromIndex: number;
    width: number;
    height: number;
    position: {
        x: number;
        y: number;
    };
    offsetX: number;
    offsetY: number;
}

export interface CastlingRights {
    whiteKingside: boolean;
    whiteQueenside: boolean;
    blackKingside: boolean;
    blackQueenside: boolean;
}

export interface GameState {
    position: BoardPosition;
    turn: PieceColor;
    playingAs: PieceColor;
    castlingRights: CastlingRights;
    enPassantTarget: number | null;
    moveHistory: Move[];
}

export interface Move {
    fromIndex: number;
    toIndex: number;
    piece: string;
    isCastling?: boolean;
    isEnPassant?: boolean;
    affectedPiece?: {
        fromIndex: number;
        toIndex: number;
    }
}