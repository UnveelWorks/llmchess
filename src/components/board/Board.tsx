import { useCallback, useRef, useState } from "react";
import { useGameStore } from "../../store/store";
import { GameMode, type Tile } from "../../types.d";
import Piece from "../piece/Piece";
import Utils from "../../helpers/utils";
import PromotionPopup from "../promotion_popup/PromotionPopup";
import type { Color } from "chess.js";

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

    const { game, isCheck } = useGameStore();

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
            !isCheck() &&
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

    const boardToRender = game.playingAs === "b"
        ? [...game.board].reverse().map((row) => [...row].reverse())
        : game.board;

    return (
        <>
            <div className="w-full h-full flex items-start justify-center select-none">
                <div className="aspect-square w-full max-w-full max-h-full">
                    <div className="grid grid-cols-8 grid-rows-8 w-full h-full rounded-md overflow-hidden shadow-lg cursor-pointer">
                        {
                            boardToRender.map((row, rowIndex) =>
                                row.map((col, colIndex) => 
                                {
                                    const square = Utils.getSquare(rowIndex, colIndex, game.playingAs);
                                    const isDark = (rowIndex + colIndex) % 2 === 1;
                                    const bgImage = isDark
                                        ? "bg-dark-square"
                                        : "bg-light-square";
                                    return (
                                        <div
                                            className={`relative flex items-center justify-center ${bgImage} bg-cover bg-center`}
                                            id={`square-${square}`}
                                            key={square}
                                        >
                                            <img 
                                                src={`/images/empty.png`} 
                                                className="w-full h-full select-none pointer-events-none" 
                                            />
                                            {
                                                (
                                                    game.lastMove?.to === square || 
                                                    game.lastMove?.from === square
                                                ) && (
                                                    <div className="absolute inset-0 bg-green-400/20 pointer-events-none" />
                                                )
                                            }
                                            <Piece
                                                value={col}
                                                onMouseDown={onPieceMouseDown}
                                                style={{
                                                    visibility: draggingPieceRef.current?.value?.square === square ? "hidden" : "visible",
                                                    pointerEvents: dragging ? "none" : "auto"
                                                }}
                                            />
                                            {
                                                overSquare === square && (
                                                    <div className="absolute z-10 inset-0 border-5 border-yellow-400 pointer-events-none" />
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