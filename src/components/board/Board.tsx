import Piece from "../piece/Piece";
import { getValidMoves, updateEnPassantTarget } from "../../helpers/chess";
import { GameContext, type GameContextType } from "../../context/GameProvider";
import { Component } from "react";
import type { DraggedPiece } from "../../types";
import type { Move } from "../../types";

class Board extends Component<
    {}, 
    {
        currentOverTile: number | null;
        draggedPiece: DraggedPiece | null;
        validMoves: Move[];
    }
>
{
    static contextType = GameContext;
    declare context: GameContextType;
    
    constructor(props: {})
    {
        super(props);

        this.state = {
            currentOverTile: null,
            draggedPiece: null,
            validMoves: []
        };
    }

    render()
    {
        const { game } = this.context;
        const board = this.getVisualBoard();
        
        return (
            <>
                <div 
                    className="aspect-square max-w-full max-h-full min-w-0 min-h-0 grid grid-cols-8 grid-rows-8 rounded-md overflow-hidden shadow-lg cursor-pointer"
                >
                    {
                        board.map((square, visualIndex) => 
                        {
                            const { piece, logicalIndex } = square;
                            const row = Math.floor(visualIndex / 8);
                            const col = visualIndex % 8;
                            const isDark = (row + col) % 2 === 1;
                            const bgImage = isDark ? "bg-dark-square" : "bg-light-square";
                            const pieceType = piece === piece.toUpperCase() ? "white" : "black";

                            let marker = null;
                            const isValid = this.state.validMoves.map(move => move.toIndex).includes(logicalIndex);
                            if (isValid && piece)
                            {
                                marker = (
                                    <div className="absolute inset-0 bg-red-700 opacity-30 pointer-events-none" />
                                );
                            }
                            else if (isValid)
                            {
                                marker = (
                                    <div className="absolute w-1/3 h-1/3 rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-teal-700 opacity-50 pointer-events-none" />
                                );
                            }

                            return (
                                <div 
                                    key={logicalIndex} 
                                    id={`tile-${logicalIndex}`}
                                    className={`relative flex items-center justify-center ${bgImage} bg-cover bg-center`}
                                >
                                    {
                                        piece && (
                                            <Piece 
                                                value={piece} 
                                                index={logicalIndex}
                                                style={{
                                                    opacity: this.state.draggedPiece?.fromIndex === logicalIndex 
                                                        ? 0 
                                                        : 1,
                                                    pointerEvents: this.state.draggedPiece || pieceType !== game.turn 
                                                        ? "none" 
                                                        : "auto"
                                                }} 
                                                onMouseDown={this.onPieceMouseDown}
                                            />
                                        )
                                    }
                                    {
                                        marker
                                    }
                                </div>
                            );
                        })
                    }
                </div>
                {
                    this.state.draggedPiece && (
                        <Piece 
                            value={this.state.draggedPiece.value} 
                            style={{
                                position: "fixed",
                                width: this.state.draggedPiece.width + "px",
                                height: this.state.draggedPiece.height + "px",
                                left: this.state.draggedPiece.position.x + "px",
                                top: this.state.draggedPiece.position.y + "px",
                                pointerEvents: "none"
                            }}
                        />
                    )
                }
            </>
        );
    }

    getVisualIndex = (index: number) => 
    {
        const { game } = this.context;
        const perspective = game.playingAs;
        return perspective === 'black' ? 63 - index : index;
    }

    getVisualBoard = () =>
    {
        const { game } = this.context;
        const visualBoard = new Array(64);
        
        for (let logicalIndex = 0; logicalIndex < 64; logicalIndex++) 
        {
            const visualIndex = this.getVisualIndex(logicalIndex);
            visualBoard[visualIndex] = {
                piece: game.position[logicalIndex],
                logicalIndex: logicalIndex
            };
        }
        
        return visualBoard;
    }

    onMouseMove = (e: MouseEvent) =>
    {
        const target = e.target as HTMLElement;

        let currentOverTile = null;
        if (target.id.startsWith("tile-"))
        {
            const index = parseInt(target.id.split("-")[1]);
            currentOverTile = index;
        }

        const draggedPiece = structuredClone(this.state.draggedPiece);
        if (draggedPiece)
        {
            draggedPiece.position.x = e.clientX - draggedPiece.offsetX;
            draggedPiece.position.y = e.clientY - draggedPiece.offsetY;
        }

        this.setState({
            draggedPiece: draggedPiece,
            currentOverTile: currentOverTile
        });
    }

    onPieceMouseDown = (value: string, index: number, e: React.MouseEvent<HTMLImageElement>) => 
    {
        const { game } = this.context;

        const target = e.target as HTMLElement;
        const rect = target.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;
    
        const newDraggedPiece = {
            value,
            fromIndex: index,
            width: rect.width,
            height: rect.height,
            position: {
                x: e.clientX - offsetX,
                y: e.clientY - offsetY
            },
            offsetX,
            offsetY
        };

        const validMoves = getValidMoves(
            game.position, 
            index, 
            game.enPassantTarget, 
            game.castlingRights
        );

        this.setState({
            draggedPiece: newDraggedPiece,
            validMoves: validMoves
        });

        document.addEventListener("mousemove", this.onMouseMove);
        document.addEventListener("mouseup", this.onMouseUp);
    }

    onMouseUp = () => 
    {
        this.move();
        document.removeEventListener("mousemove", this.onMouseMove);
        document.removeEventListener("mouseup", this.onMouseUp);
    };

    move = () => 
    {
        const { game, setGame } = this.context;
        const newGame = structuredClone(game);

        if (
            this.state.currentOverTile === null ||
            !this.state.draggedPiece ||
            this.state.draggedPiece.fromIndex === this.state.currentOverTile ||
            !this.state.validMoves.map(move => move.toIndex).includes(this.state.currentOverTile)
        )
        {
            this.setState({
                draggedPiece: null,
                validMoves: []
            });
            return;
        }

        const isWhite = newGame.turn === "white";

        const newPosition = [...newGame.position];
        newPosition[this.state.draggedPiece.fromIndex] = "";
        newPosition[this.state.currentOverTile!] = this.state.draggedPiece.value;

        const move = this.state.validMoves.find(move => move.toIndex === this.state.currentOverTile);
        if (move?.isCastling)
        {
            const piece = newPosition[move.affectedPiece!.fromIndex];
            newPosition[move.affectedPiece!.fromIndex] = "";
            newPosition[move.affectedPiece!.toIndex] = piece;

            if (isWhite)
            {
                newGame.castlingRights.whiteKingside = false;
                newGame.castlingRights.whiteQueenside = false;
            } 
            else 
            {
                newGame.castlingRights.blackKingside = false;
                newGame.castlingRights.blackQueenside = false;
            }
        }

        if (move?.isEnPassant)
        {
            newPosition[move.affectedPiece!.fromIndex] = "";
        }

        newGame.enPassantTarget = updateEnPassantTarget(
            this.state.draggedPiece.fromIndex, 
            this.state.currentOverTile!, 
            this.state.draggedPiece.value
        );

        setGame({
            ...newGame,
            position: newPosition,
            turn: isWhite ? "black" : "white"
        });

        this.setState({
            draggedPiece: null,
            validMoves: [],
            currentOverTile: null
        });
    }
}

export default Board;