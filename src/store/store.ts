import { create } from "zustand";
import { Chess, type Color } from "chess.js";
import { GameMode, GameOverReason, PlayerType, type Game, type GameResult, type Players } from "../types.d";
import type { NAISDK } from "../helpers/aisdk";
import { playSound } from "../helpers/sounds";

interface GameStore {
	game: Game;
	startGame: (players: Players, mode: GameMode, playingAs: Color) => void;
	movePiece: (move: string) => void;
	resign: (color: Color) => void;
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

function getGameResult(): GameResult | null {
	if (!chess.isGameOver()) return null;

	if (chess.isCheckmate()) {
		const winner: Color = chess.turn() === "w" ? "b" : "w";
		return { reason: GameOverReason.Checkmate, winner };
	}

	if (chess.isStalemate()) {
		return { reason: GameOverReason.Stalemate, winner: null };
	}
	if (chess.isInsufficientMaterial()) {
		return { reason: GameOverReason.InsufficientMaterial, winner: null };
	}
	if (chess.isThreefoldRepetition()) {
		return { reason: GameOverReason.ThreefoldRepetition, winner: null };
	}
	if (chess.isDraw()) {
		return { reason: GameOverReason.FiftyMoveRule, winner: null };
	}

	return null;
}

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
		result: null,
		history: [],
	},
	startGame: (
		players: Players,
		mode: GameMode,
		playingAs: Color,
	) =>
	{
		chess.reset();
		playSound('game-start');
		set(prev => ({
			game: {
				...prev.game,
				players,
				mode,
				playingAs,
				playing: true,
				board: chess.board(),
				turn: chess.turn(),
				lastMove: null,
				result: null,
				history: [],
			}
		}));
	},
	movePiece: (move: string) =>
	{
		const moveResult = chess.move(move);
		const result = getGameResult();

		if (result) {
			playSound('game-end');
		} else if (chess.isCheck()) {
			playSound('check');
		} else if (moveResult.captured) {
			playSound('capture');
		} else {
			playSound('move');
		}

		set(prev => ({
			game: {
				...prev.game,
				board: chess.board(),
				turn: chess.turn(),
				lastMove: chess.history({ verbose: true }).reverse()[0],
				playing: !chess.isGameOver(),
				result,
				history: chess.history(),
			}
		}));
	},
	resign: (color: Color) =>
	{
		playSound('game-end');
		const winner: Color = color === "w" ? "b" : "w";
		set(prev => ({
			game: {
				...prev.game,
				playing: false,
				result: {
					reason: GameOverReason.Resignation,
					winner,
				},
			}
		}));
	},
	isCheck: () => chess.isCheck(),
	reset: () => {
		chess.reset();
		set({
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
				playingAs: "w",
				playing: false,
				result: null,
				history: [],
			}
		});
	},
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