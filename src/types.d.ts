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
    checkmated: boolean;
    draw: boolean;
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