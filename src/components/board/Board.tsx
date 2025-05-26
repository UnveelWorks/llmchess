import { Component } from "react";
import defaultPosition from "../../data/defaultPosition";
import Piece from "../piece/Piece";
import type { DraggedPiece, GameState, Move } from "../../types";
import { getValidMoves, updateEnPassantTarget } from "../../helpers/chess";

class Board extends Component<
    {}, 
    {
        turn: "white" | "black";
        position: string[];
        draggedPiece: DraggedPiece | null;
        currentOverTile: number | null;
        validMoves: Move[];
    }
>
{
    private gameState: GameState;
    constructor(props: {})
    {
        super(props);

        this.gameState = {
            castlingRights: {
                whiteKingside: true,
                whiteQueenside: true,
                blackKingside: true,
                blackQueenside: true
            },
            enPassantTarget: 20,
            moveHistory: []
        };

        this.state = {
            turn: "white",
            position: [...defaultPosition],
            draggedPiece: null,
            currentOverTile: null,
            validMoves: []
        };
    }

    render()
    {
        return (
            <>
                <div 
                    className="w-full aspect-square grid grid-cols-8 grid-rows-8 rounded-md overflow-hidden shadow-lg cursor-pointer"
                >
                    {
                        this.state.position.map((piece, index) => 
                        {
                            const row = Math.floor(index / 8);
                            const col = index % 8;
                            const isDark = (row + col) % 2 === 1;
                            const bgImage = isDark ? "bg-dark-square" : "bg-light-square";
                            const pieceType = piece === piece.toUpperCase() ? "white" : "black";

                            return (
                                <div 
                                    key={index} 
                                    id={`tile-${index}`}
                                    className={`relative flex items-center justify-center ${bgImage} bg-cover bg-center`}
                                >
                                    {
                                        piece && (
                                            <Piece 
                                                value={piece} 
                                                index={index}
                                                style={{
                                                    opacity: this.state.draggedPiece?.fromIndex === index ? 0 : 1,
                                                    pointerEvents: 
                                                    this.state.draggedPiece || pieceType !== this.state.turn ? "none" : "auto"
                                                }} 
                                                onMouseDown={this.onPieceMouseDown}
                                            />
                                        )
                                    }

                                    {
                                        this.state.validMoves.map(move => move.toIndex).includes(index) && (
                                            <div className="absolute inset-0 bg-red-500 opacity-50 pointer-events-none" />
                                        )
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
            draggedPiece,
            currentOverTile
        });
    }

    onPieceMouseDown = (value: string, index: number, e: React.MouseEvent<HTMLImageElement>) => 
    {
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

        const validMoves = getValidMoves(this.state.position, index, this.gameState);
        this.setState({
            draggedPiece: newDraggedPiece,
            validMoves
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

        const newState = {
            position: this.state.position,
            turn: this.state.turn,
            draggedPiece: null,
            currentOverTile: null,
            validMoves: []
        }

        const isWhite = this.state.turn === "white";

        const newPosition = [...this.state.position];
        newPosition[this.state.draggedPiece!.fromIndex] = "";
        newPosition[this.state.currentOverTile!] = this.state.draggedPiece!.value;

        const move = this.state.validMoves.find(move => move.toIndex === this.state.currentOverTile);
        if (move?.isCastling)
        {
            const piece = newPosition[move.affectedPiece!.fromIndex];
            newPosition[move.affectedPiece!.fromIndex] = "";
            newPosition[move.affectedPiece!.toIndex] = piece;

            if (isWhite)
            {
                this.gameState.castlingRights.whiteKingside = false;
                this.gameState.castlingRights.whiteQueenside = false;
            } 
            else 
            {
                this.gameState.castlingRights.blackKingside = false;
                this.gameState.castlingRights.blackQueenside = false;
            }
        }

        if (move?.isEnPassant)
        {
            newPosition[move.affectedPiece!.fromIndex] = "";
        }

        this.gameState.enPassantTarget = updateEnPassantTarget(
            this.state.draggedPiece!.fromIndex, 
            this.state.currentOverTile!, 
            this.state.draggedPiece!.value
        );

        newState.position = newPosition;
        newState.turn = isWhite ? "black" : "white";

        this.setState(newState);
    }
}

export default Board;