
export type BoardPosition = string[];
export interface DraggedPiece {
    value: string;
    fromIndex: number;
    width: number;
    height: number;
    position: {
        x: number;
        y: number;
    };
    offsetX: number;
    offsetY: number;
}

export interface GameState {
    castlingRights: {
        whiteKingside: boolean,
        whiteQueenside: boolean, 
        blackKingside: boolean,
        blackQueenside: boolean
    },
    enPassantTarget: number | null,
    moveHistory: []
}

export interface Move {
    fromIndex: number;
    toIndex: number;
    piece: string;
    isCastling?: boolean;
    isEnPassant?: boolean;
    affectedPiece?: {
        fromIndex: number;
        toIndex: number;
    }
}