import { useLayoutEffect, useRef } from "react";
import { twJoin, twMerge } from "tailwind-merge";
import type { MoveStats } from "../../types.d";

function MoveHistory(props: {
    history: string[];
    turn: string;
    className?: string;
    onMoveClick?: (index: number) => void;
    viewingMoveIndex?: number | null;
    moveStats?: (MoveStats | null)[];
}) {
    const scrollRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, [props.turn]);

    return (
        <div className={twMerge("flex-1 overflow-auto min-h-0", props.className)} ref={scrollRef}>
            {props.history.length === 0 ? (
                <div className="flex items-center justify-center h-full p-4">
                    <span className="text-sm text-neutral-600">No moves yet</span>
                </div>
            ) : (
                <div className="grid grid-cols-[2.5rem_1fr_1fr] gap-0 text-sm font-mono p-1">
                    {Array.from({ length: Math.ceil(props.history.length / 2) }, (_, index) => {
                        const moveNumber = index + 1;
                        const whiteMove = props.history[index * 2];
                        const blackMove = props.history[index * 2 + 1];
                        const whiteMoveIndex = index * 2;
                        const blackMoveIndex = index * 2 + 1;
                        const isLatestWhite = whiteMoveIndex === props.history.length - 1;
                        const isLatestBlack = blackMoveIndex === props.history.length - 1;
                        const isViewingWhite = props.viewingMoveIndex === whiteMoveIndex;
                        const isViewingBlack = props.viewingMoveIndex === blackMoveIndex;
                        const whiteStats = props.moveStats?.[whiteMoveIndex];
                        const blackStats = props.moveStats?.[blackMoveIndex];
                        const isWhiteAi = whiteStats != null;
                        const isBlackAi = blackStats != null;

                        return [
                            <div
                                key={`${index}-number`}
                                className="h-7 flex items-center justify-center"
                            >
                                <span className="text-xs text-neutral-500">
                                    {moveNumber}.
                                </span>
                            </div>,
                            <div
                                key={`${index}-white`}
                                className={twJoin(
                                    "h-7 flex items-center justify-center px-2 rounded cursor-pointer hover:bg-white/5",
                                    isViewingWhite
                                        ? "bg-amber-500/15 text-amber-300"
                                        : isLatestWhite && props.viewingMoveIndex == null && "bg-blue-500/10 text-blue-300"
                                )}
                                onClick={() => props.onMoveClick?.(whiteMoveIndex)}
                                title={isWhiteAi ? `${((whiteStats.inputTokens + whiteStats.outputTokens) / 1000).toFixed(1)}k tokens · ${whiteStats.steps} step${whiteStats.steps !== 1 ? 's' : ''}` : undefined}
                            >
                                <span className={twJoin("font-medium text-sm", isWhiteAi && !isViewingWhite && !(isLatestWhite && props.viewingMoveIndex == null) && "text-violet-300")}>
                                    {whiteMove || ''}
                                </span>
                            </div>,
                            <div
                                key={`${index}-black`}
                                className={twJoin(
                                    "h-7 flex items-center justify-center px-2 rounded",
                                    blackMove && "cursor-pointer hover:bg-white/5",
                                    isViewingBlack
                                        ? "bg-amber-500/15 text-amber-300"
                                        : isLatestBlack && props.viewingMoveIndex == null && "bg-blue-500/10 text-blue-300"
                                )}
                                onClick={() => blackMove && props.onMoveClick?.(blackMoveIndex)}
                                title={isBlackAi ? `${((blackStats.inputTokens + blackStats.outputTokens) / 1000).toFixed(1)}k tokens · ${blackStats.steps} step${blackStats.steps !== 1 ? 's' : ''}` : undefined}
                            >
                                <span className={twJoin("font-medium text-sm", isBlackAi && !isViewingBlack && !(isLatestBlack && props.viewingMoveIndex == null) && "text-violet-300")}>
                                    {blackMove || ''}
                                </span>
                            </div>
                        ];
                    }).flat()}
                </div>
            )}
        </div>
    );
}

export default MoveHistory;
