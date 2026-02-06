import { useCallback, useRef, useState } from "react";
import { useGameStore } from "../../store/store";
import { GameMode, type Tile } from "../../types.d";
import Piece from "../piece/Piece";
import Utils from "../../helpers/utils";
import PromotionPopup from "../promotion_popup/PromotionPopup";
import type { Color } from "chess.js";

const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

function Board(props: {
    move: (move: string) => void;
})
{
    const [dragging, setDragging] = useState(false);
    const [draggingPosition, setDraggingPosition] = useState<{
        x: number;
        y: number;
    }>({ x: 0, y: 0 });
    const draggingPieceRef = useRef<{
        value: Tile | null;
        width: number;
        height: number;
        offsetX: number;
        offsetY: number;
        moveTo: string | null;
    } | null>(null);
    const [overSquare, setOverSquare] = useState<string | null>(null);
    const [promotionSquare, setPromotionSquare] = useState<{
        square: string;
        color: Color;
    } | null>(null);

    const { game } = useGameStore();

    const movePiece = useCallback((promotionPiece?: string) =>
    {
        try
        {
            const square = draggingPieceRef.current!.value!.square;
            const moveTo = draggingPieceRef.current!.moveTo!;
            props.move(`${square}-${moveTo}${promotionPiece || ""}`);
        }
        catch (err)
        {}

        setPromotionSquare(null);
        draggingPieceRef.current = null;
        setDragging(false);
        setOverSquare(null);
    }, [])

    const handlePromotion = useCallback((piece: string) =>
    {
        movePiece(piece);
    }, []);

    const onMouseMove = useCallback((e: MouseEvent) =>
    {
        const target = e.target as HTMLElement;

        if (target.id.startsWith("square-"))
        {
            const square = target.id.split("-")[1];
            setOverSquare(square);
            draggingPieceRef.current!.moveTo = square;
        }

        if (draggingPieceRef.current)
        {
            setDraggingPosition({
                x: e.clientX - draggingPieceRef.current!.offsetX,
                y: e.clientY - draggingPieceRef.current!.offsetY
            });
        }
    }, []);

    const onMouseUp = useCallback(() =>
    {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);

        if (
            !draggingPieceRef.current ||
            !draggingPieceRef.current.moveTo ||
            !draggingPieceRef.current.value
        ) return;

        if (
            draggingPieceRef.current.value.type === "p" &&
            (
                draggingPieceRef.current.moveTo.endsWith("8") ||
                draggingPieceRef.current.moveTo.endsWith("1")
            )
        )
        {
            setPromotionSquare({
                square: draggingPieceRef.current.moveTo,
                color: draggingPieceRef.current.value.color
            });
        }
        else
        {
            movePiece();
        }
    }, []);

    const onPieceMouseDown = useCallback((value: Tile, e: React.MouseEvent<HTMLImageElement>) =>
    {
        if (
            !game.playing ||
            game.mode !== GameMode.HumanVsAI ||
            game.playingAs !==  value.color
        ) return;

        e.preventDefault();

        const target = e.target as HTMLElement;
        const rect = target.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;

        const newDraggedPiece = {
            value,
            width: rect.width,
            height: rect.height,
            offsetX,
            offsetY,
            moveTo: null
        };

        draggingPieceRef.current = newDraggedPiece;
        setDraggingPosition({
            x: e.clientX - offsetX,
            y: e.clientY - offsetY
        });
        setDragging(true);

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    }, [game.playing, game.mode, game.playingAs]);

    const onTouchMove = useCallback((e: TouchEvent) => {
        const touch = e.touches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement | null;

        if (target?.id.startsWith("square-")) {
            const square = target.id.split("-")[1];
            setOverSquare(square);
            draggingPieceRef.current!.moveTo = square;
        }

        if (draggingPieceRef.current) {
            setDraggingPosition({
                x: touch.clientX - draggingPieceRef.current.offsetX,
                y: touch.clientY - draggingPieceRef.current.offsetY,
            });
        }
    }, []);

    const onTouchEnd = useCallback(() => {
        document.removeEventListener("touchmove", onTouchMove);
        document.removeEventListener("touchend", onTouchEnd);

        if (
            !draggingPieceRef.current ||
            !draggingPieceRef.current.moveTo ||
            !draggingPieceRef.current.value
        ) {
            draggingPieceRef.current = null;
            setDragging(false);
            setOverSquare(null);
            return;
        }

        if (
            draggingPieceRef.current.value.type === "p" &&
            (
                draggingPieceRef.current.moveTo.endsWith("8") ||
                draggingPieceRef.current.moveTo.endsWith("1")
            )
        ) {
            setPromotionSquare({
                square: draggingPieceRef.current.moveTo,
                color: draggingPieceRef.current.value.color,
            });
        } else {
            movePiece();
        }
    }, []);

    const onPieceTouchStart = useCallback((value: Tile, e: React.TouchEvent<HTMLImageElement>) => {
        if (
            !game.playing ||
            game.mode !== GameMode.HumanVsAI ||
            game.playingAs !== value.color
        ) return;

        e.preventDefault();

        const touch = e.touches[0];
        const target = e.target as HTMLElement;
        const rect = target.getBoundingClientRect();
        const offsetX = touch.clientX - rect.left;
        const offsetY = touch.clientY - rect.top;

        const newDraggedPiece = {
            value,
            width: rect.width,
            height: rect.height,
            offsetX,
            offsetY,
            moveTo: null,
        };

        draggingPieceRef.current = newDraggedPiece;
        setDraggingPosition({
            x: touch.clientX - offsetX,
            y: touch.clientY - offsetY,
        });
        setDragging(true);

        document.addEventListener("touchmove", onTouchMove, { passive: false });
        document.addEventListener("touchend", onTouchEnd);
    }, [game.playing, game.mode, game.playingAs]);

    const boardToRender = game.playingAs === "b"
        ? [...game.board].reverse().map((row) => [...row].reverse())
        : game.board;

    const displayFiles = game.playingAs === "b" ? [...files].reverse() : files;
    const displayRanks = game.playingAs === "b" ? [...ranks].reverse() : ranks;

    return (
        <>
            <div className="w-full select-none touch-none">
                <div className="p-0.5 rounded-xl bg-gradient-to-br from-amber-900/30 to-neutral-800/50 shadow-[0_8px_32px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.3)]">
                    <div className="grid grid-cols-8 grid-rows-8 w-full aspect-square rounded-lg overflow-hidden cursor-pointer">
                            {
                                boardToRender.map((row, rowIndex) =>
                                    row.map((col, colIndex) =>
                                    {
                                        const square = Utils.getSquare(rowIndex, colIndex, game.playingAs);
                                        const isDark = (rowIndex + colIndex) % 2 === 1;
                                        const bgImage = isDark
                                            ? "bg-dark-square"
                                            : "bg-light-square";
                                        const isLastRow = rowIndex === 7;
                                        const isFirstCol = colIndex === 0;
                                        return (
                                            <div
                                                className={`relative flex items-center justify-center ${bgImage} bg-cover bg-center`}
                                                id={`square-${square}`}
                                                key={square}
                                            >
                                                <img
                                                    src={`/images/empty.webp`}
                                                    className="w-full h-full select-none pointer-events-none"
                                                />
                                                {/* Coordinate labels */}
                                                {isLastRow && (
                                                    <span className={`absolute bottom-0.5 right-1 text-[10px] font-medium pointer-events-none select-none ${isDark ? "text-white/40" : "text-black/30"}`}>
                                                        {displayFiles[colIndex]}
                                                    </span>
                                                )}
                                                {isFirstCol && (
                                                    <span className={`absolute top-0.5 left-1 text-[10px] font-medium pointer-events-none select-none ${isDark ? "text-white/40" : "text-black/30"}`}>
                                                        {displayRanks[rowIndex]}
                                                    </span>
                                                )}
                                                {
                                                    (
                                                        game.lastMove?.to === square ||
                                                        game.lastMove?.from === square
                                                    ) && (
                                                        <div className="absolute inset-0 bg-amber-400/25 pointer-events-none" />
                                                    )
                                                }
                                                <Piece
                                                    value={col}
                                                    onMouseDown={onPieceMouseDown}
                                                    onTouchStart={onPieceTouchStart}
                                                    style={{
                                                        visibility: draggingPieceRef.current?.value?.square === square ? "hidden" : "visible",
                                                        pointerEvents: dragging ? "none" : "auto"
                                                    }}
                                                />
                                                {
                                                    overSquare === square && (
                                                        <div className="absolute z-10 inset-0 border-4 border-emerald-400/60 pointer-events-none shadow-[inset_0_0_8px_rgba(52,211,153,0.2)]" />
                                                    )
                                                }
                                                {
                                                    promotionSquare?.square === square && (
                                                        <PromotionPopup
                                                            color={promotionSquare.color}
                                                            playingAs={game.playingAs}
                                                            handlePromotion={handlePromotion}
                                                        />
                                                    )
                                                }
                                            </div>
                                        );
                                    })
                                )
                            }
                    </div>
                </div>
            </div>

            {
                dragging && draggingPieceRef.current && !promotionSquare && (
                    <Piece
                        value={draggingPieceRef.current.value}
                        style={{
                            position: "fixed",
                            zIndex: 1000,
                            width: draggingPieceRef.current.width + "px",
                            height: draggingPieceRef.current.height + "px",
                            left: draggingPosition?.x + "px",
                            top: draggingPosition?.y + "px",
                            pointerEvents: "none"
                        }}
                    />
                )
            }
        </>
    );
}

export default Board;
