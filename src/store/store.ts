import { create } from "zustand";
import { Chess, type Color, type Square } from "chess.js";
import { GameMode, GameOverReason, PlayerType, type Game, type GameResult, type MoveStats, type Players } from "../types.d";
import type { NAISDK } from "../helpers/aisdk";
import { playSound } from "../helpers/sounds";

interface GameStore {
	game: Game;
	startGame: (players: Players, mode: GameMode, playingAs: Color) => void;
	movePiece: (move: string, stats?: MoveStats | null) => void;
	resign: (color: Color) => void;
	isCheck: () => boolean;
	reset: () => void;
	addAiStats: (color: Color, usage: { inputTokens: number | undefined; outputTokens: number | undefined }, steps: number) => void;
	viewBoard: (index: number | null) => void;
	setPaused: (paused: boolean) => void;
	setDrawOffered: (offered: boolean) => void;
	drawAgreement: () => void;
}

interface SettingsStore {
	apiKeys: NAISDK.ApiKeys;
	retries: number;
	prompts: {
		moveGeneration: string;
		moveCorrection: string;
	};
	soundEnabled: boolean;
	setApiKeys: (apiKeys: NAISDK.ApiKeys) => void;
	setRetries: (retries: number) => void;
	setPrompts: (prompts: {
		moveGeneration: string;
		moveCorrection: string;
	}) => void;
	setSoundEnabled: (enabled: boolean) => void;
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
	soundEnabled: true,
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
	},
	setSoundEnabled: (enabled: boolean) =>
	{
		set({ soundEnabled: enabled });
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

const defaultAiStats = () => ({
	white: { inputTokens: 0, outputTokens: 0, steps: 0 },
	black: { inputTokens: 0, outputTokens: 0, steps: 0 },
});

const useGameStore = create<GameStore>((set) => ({
	game: {
		playing: false,
		paused: false,
		drawOffered: false,
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
		moveStats: [],
		aiStats: defaultAiStats(),
		viewingMoveIndex: null,
		viewingBoard: null,
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
				paused: false,
				drawOffered: false,
				board: chess.board(),
				turn: chess.turn(),
				lastMove: null,
				result: null,
				history: [],
				moveStats: [],
				aiStats: defaultAiStats(),
				viewingMoveIndex: null,
				viewingBoard: null,
			}
		}));
	},
	movePiece: (move: string, stats?: MoveStats | null) =>
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
				moveStats: [...prev.game.moveStats, stats ?? null],
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
				paused: false,
				drawOffered: false,
				result: null,
				history: [],
				moveStats: [],
				aiStats: defaultAiStats(),
				viewingMoveIndex: null,
				viewingBoard: null,
			}
		});
	},
	addAiStats: (color: Color, usage: { inputTokens: number | undefined; outputTokens: number | undefined }, steps: number) => {
		set(prev => {
			const key = color === "w" ? "white" : "black";
			const current = prev.game.aiStats[key];
			return {
				game: {
					...prev.game,
					aiStats: {
						...prev.game.aiStats,
						[key]: {
							inputTokens: current.inputTokens + (usage.inputTokens || 0),
							outputTokens: current.outputTokens + (usage.outputTokens || 0),
							steps: current.steps + steps,
						},
					},
				},
			};
		});
	},
	setPaused: (paused: boolean) => {
		set(prev => ({
			game: { ...prev.game, paused }
		}));
	},
	setDrawOffered: (offered: boolean) => {
		set(prev => ({
			game: { ...prev.game, drawOffered: offered }
		}));
	},
	drawAgreement: () => {
		playSound('game-end');
		set(prev => ({
			game: {
				...prev.game,
				playing: false,
				paused: false,
				drawOffered: false,
				result: {
					reason: GameOverReason.DrawAgreement,
					winner: null,
				},
			}
		}));
	},
	viewBoard: (index: number | null) => {
		if (index === null) {
			set(prev => ({
				game: {
					...prev.game,
					viewingMoveIndex: null,
					viewingBoard: null,
				},
			}));
			return;
		}
		const history = chess.history();
		const tempChess = new Chess();
		for (let i = 0; i <= index && i < history.length; i++) {
			tempChess.move(history[i]);
		}
		set(prev => ({
			game: {
				...prev.game,
				viewingMoveIndex: index,
				viewingBoard: tempChess.board(),
			},
		}));
	},
}));

function getFen()
{
	return chess.fen();
}

function getLegalMoves(): string[]
{
	return chess.moves();
}

function isLegalMove(san: string): boolean
{
	return chess.moves().includes(san);
}

function getLegalMovesForSquare(square: string): string[]
{
	return chess.moves({ square: square as Square, verbose: true }).map(m => m.to);
}

function getPGN(players: Players, mode: GameMode, result: GameResult | null): string
{
	const date = new Date().toISOString().split('T')[0].replace(/-/g, '.');
	const white = mode === GameMode.AIVsAI
		? (players.white.model?.name || "White AI")
		: (players.white.type === PlayerType.Human ? "Human" : (players.white.model?.name || "AI"));
	const black = mode === GameMode.AIVsAI
		? (players.black.model?.name || "Black AI")
		: (players.black.type === PlayerType.Human ? "Human" : (players.black.model?.name || "AI"));
	const resultStr = !result ? "*" : result.winner === "w" ? "1-0" : result.winner === "b" ? "0-1" : "1/2-1/2";
	return `[Event "LLM Chess"]\n[Date "${date}"]\n[White "${white}"]\n[Black "${black}"]\n[Result "${resultStr}"]\n\n${chess.pgn()} ${resultStr}`;
}

export {
	useGameStore,
	useSettingsStore,
	getFen,
	getLegalMoves,
	isLegalMove,
	getLegalMovesForSquare,
	getPGN
};