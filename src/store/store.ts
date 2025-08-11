import { create } from "zustand";
import { Chess, type Color } from "chess.js";
import { GameMode, PlayerType, type Game, type Players } from "../types.d";
import type { NAISDK } from "../helpers/aisdk";

interface GameStore {
	game: Game;
	startGame: (players: Players, mode: GameMode, playingAs: Color) => void;
	movePiece: (move: string) => void;
	isCheck: () => boolean;
	reset: () => void;
}

interface SettingsStore {
	apiKeys: NAISDK.ApiKeys;
	retries: number;
	prompts: {
		moveGeneration: string;
		moveCorrection: string;
	};
	setApiKeys: (apiKeys: NAISDK.ApiKeys) => void;
	setRetries: (retries: number) => void;
	setPrompts: (prompts: {
		moveGeneration: string;
		moveCorrection: string;
	}) => void;
}

const chess = new Chess();

const useSettingsStore = create<SettingsStore>((set) => ({
	apiKeys: {
		openrouter: "",
	},
	retries: 10,
	prompts: {
		moveGeneration: "",
		moveCorrection: "",
	},
	setApiKeys: (apiKeys: NAISDK.ApiKeys) => 
	{
		set({ apiKeys });
	},
	setRetries: (retries: number) => 
	{
		set({ retries });
	},
	setPrompts: (prompts: {
		moveGeneration: string;
		moveCorrection: string;
	}) => 
	{
		set({ prompts });
	}
}));

const useGameStore = create<GameStore>((set) => ({
	game: {
		playing: false,
		playingAs: "w",
		mode: GameMode.HumanVsAI,
		players: {
			white: {
				type: PlayerType.Human,
			},
			black: {
				type: PlayerType.Human,
			}
		},
		board: chess.board(),
		turn: chess.turn(),
		lastMove: null,
		checkmated: false,
		draw: false,
		history: [],
	},
	startGame: (
		players: Players,
		mode: GameMode,
		playingAs: Color,
	) => 
	{
		set(prev => ({ 
			game: {
				...prev.game,
				players: players,
				mode: mode,
				playingAs: playingAs,
				playing: true,
			}
		}));
	},
	movePiece: (move: string) => 
	{
		chess.move(move);
		set(prev => ({ 
			game: {
				...prev.game,
				board: chess.board(),
				turn: chess.turn(),
				lastMove: chess.history({ verbose: true }).reverse()[0],
				checkmated: chess.isCheckmate(),
				playing: !chess.isGameOver(),
				draw: chess.isDraw(),
				history: chess.history(),
			} 
		}));
	},
	isCheck: () => chess.isCheck(),
	reset: () => set({ 
		game: {
			mode: GameMode.HumanVsAI,
			players: {
				white: {
					type: PlayerType.Human,
				},
				black: {
					type: PlayerType.Human,
				}
			},
			board: chess.board(),
			turn: chess.turn(),
			lastMove: null,
			checkmated: false,
			playingAs: "w",
			playing: false,
			draw: false,
			history: [],
		} 
	}),
}));

function getFen()
{
	return chess.fen();
}

export {
	useGameStore,
	useSettingsStore,
	getFen
};