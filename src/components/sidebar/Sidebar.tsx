import type { ReactNode } from "react";
import type { MoveStats } from "../../types.d";
import MoveHistory from "../move_history/MoveHistory";

function Sidebar(props: {
    history: string[];
    turn: string;
    playing: boolean;
    header?: ReactNode;
    footer?: ReactNode;
    onMoveClick?: (index: number) => void;
    viewingMoveIndex?: number | null;
    moveStats?: (MoveStats | null)[];
}) {
    return (
        <div className="hidden lg:flex w-80 self-stretch flex-col bg-neutral-800/50 backdrop-blur-md rounded-xl border border-white/[0.06] overflow-hidden">
            {/* Header */}
            <div className="h-11 px-4 flex items-center justify-between border-b border-white/[0.06] shrink-0">
                <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Moves</span>
                {props.header}
            </div>

            {/* Body — scrollable move list */}
            <MoveHistory
                history={props.history}
                turn={props.turn}
                onMoveClick={props.onMoveClick}
                viewingMoveIndex={props.viewingMoveIndex}
                moveStats={props.moveStats}
            />

            {/* Footer */}
            {props.footer && (
                <div className="h-11 px-4 flex items-center justify-end gap-2 border-t border-white/[0.06] shrink-0">
                    {props.footer}
                </div>
            )}
        </div>
    );
}

export default Sidebar;
