import Button from "../button/Button";
import { XSvg } from "../svgs/Svgs";
import { GameMode, GameOverReason, type GameResult, type Players } from "../../types.d";
import type { Color } from "chess.js";
import { getPGN } from "../../store/store";
import toast from "react-hot-toast";

function getReasonText(reason: GameOverReason): string {
    switch (reason) {
        case GameOverReason.Checkmate:
            return "Checkmate";
        case GameOverReason.Stalemate:
            return "Stalemate";
        case GameOverReason.InsufficientMaterial:
            return "Insufficient Material";
        case GameOverReason.ThreefoldRepetition:
            return "Threefold Repetition";
        case GameOverReason.FiftyMoveRule:
            return "50-Move Rule";
        case GameOverReason.Resignation:
            return "Resignation";
        case GameOverReason.DrawAgreement:
            return "Draw by Agreement";
    }
}

function getHeadline(
    result: GameResult,
    players: Players,
    mode: GameMode,
    playingAs: Color
): string {
    if (!result.winner) return "Draw";

    if (mode === GameMode.HumanVsAI) {
        if (result.winner === playingAs) return "You win!";
        const aiModel = playingAs === "w"
            ? players.black.model?.name
            : players.white.model?.name;
        return `${aiModel || "AI"} wins!`;
    }

    const model = result.winner === "w"
        ? players.white.model?.name
        : players.black.model?.name;
    return `${model || (result.winner === "w" ? "White" : "Black")} wins!`;
}

function GameOver(props: {
    result: GameResult;
    players: Players;
    mode: GameMode;
    playingAs: Color;
    onNewGame: () => void;
    onClose: () => void;
})
{
    const headline = getHeadline(props.result, props.players, props.mode, props.playingAs);
    const reason = getReasonText(props.result.reason);
    const isWin = props.mode === GameMode.HumanVsAI && props.result.winner === props.playingAs;
    const isDraw = !props.result.winner;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-sm mx-4 rounded-2xl bg-neutral-800/90 border border-white/10 shadow-[0_24px_64px_rgba(0,0,0,0.5)] animate-scale-in relative">
                <button
                    onClick={props.onClose}
                    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                    <XSvg className="w-4 h-4" />
                </button>
                <div className="flex flex-col items-center gap-4 p-8">
                    {/* Result icon */}
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                        isDraw
                            ? "bg-gradient-to-br from-neutral-500 to-neutral-600"
                            : isWin
                                ? "bg-gradient-to-br from-amber-400 to-yellow-600"
                                : "bg-gradient-to-br from-red-500 to-red-700"
                    }`}>
                        <span className="text-2xl">
                            {isDraw ? "=" : isWin ? "♔" : "♚"}
                        </span>
                    </div>

                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-white">{headline}</h2>
                        <p className="mt-1 text-sm text-neutral-400">{reason}</p>
                    </div>

                    <Button theme="blue" type="large" onClick={props.onNewGame} className="mt-2 w-full">
                        New Game
                    </Button>
                    <Button type="medium" onClick={() => {
                        const pgn = getPGN(props.players, props.mode, props.result);
                        navigator.clipboard.writeText(pgn);
                        toast.success("PGN copied!");
                    }} className="w-full text-neutral-400">
                        Copy PGN
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default GameOver;
