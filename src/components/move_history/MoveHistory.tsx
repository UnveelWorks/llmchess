import { useLayoutEffect, useRef } from "react";
import { twJoin, twMerge } from "tailwind-merge";

function MoveHistory(props: {
    history: string[];
    turn: string;
    className?: string;
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
                        const isLatestWhite = index * 2 === props.history.length - 1;
                        const isLatestBlack = index * 2 + 1 === props.history.length - 1;

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
                                    "h-7 flex items-center justify-center px-2 rounded",
                                    isLatestWhite && "bg-blue-500/10 text-blue-300"
                                )}
                            >
                                <span className="font-medium text-sm">
                                    {whiteMove || ''}
                                </span>
                            </div>,
                            <div
                                key={`${index}-black`}
                                className={twJoin(
                                    "h-7 flex items-center justify-center px-2 rounded",
                                    isLatestBlack && "bg-blue-500/10 text-blue-300"
                                )}
                            >
                                <span className="font-medium text-sm">
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
