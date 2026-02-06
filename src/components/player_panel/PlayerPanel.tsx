import type { Color } from "chess.js";
import type { ReactNode } from "react";
import { twJoin } from "tailwind-merge";

function PlayerPanel(props: {
    name: string;
    isActive: boolean;
    statusText?: string;
    capturedPieces: string[];
    color: Color;
    actions?: ReactNode;
}) {
    return (
        <div className="w-full h-8 lg:h-11 flex items-center gap-2 lg:gap-3 px-1 shrink-0">
            <div className="w-3.5 h-3.5 lg:w-4 lg:h-4 rounded-full border-2 border-neutral-600 flex items-center justify-center shrink-0">
                {props.isActive && (
                    <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-green-500 rounded-full shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
                )}
            </div>
            <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className={twJoin(
                    "text-sm font-medium truncate",
                    props.isActive ? "text-white" : "text-neutral-400"
                )}>
                    {props.name}
                </span>
                {props.statusText && (
                    <span className="text-xs text-neutral-500 italic animate-pulse shrink-0 hidden lg:inline">
                        {props.statusText}
                    </span>
                )}
            </div>
            <div className="flex items-center gap-0.5 shrink-0">
                {props.capturedPieces.map((piece, i) => (
                    <img
                        key={`${piece}-${i}`}
                        src={`/images/${piece}.webp`}
                        className="w-4 h-4 opacity-70"
                    />
                ))}
            </div>
            {props.actions && (
                <div className="flex items-center gap-1 shrink-0 lg:hidden">
                    {props.actions}
                </div>
            )}
        </div>
    );
}

export default PlayerPanel;
