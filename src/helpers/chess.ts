import type { CastlingRights, GameState, Move } from "../types";

export function getValidMoves(
    position: string[], 
    pieceIndex: number, 
    enPassantTarget: number | null,
    castlingRights: CastlingRights,

): Move[] 
{
    const piece = position[pieceIndex];
    if (!piece) return [];

    const isWhite = piece === piece.toUpperCase();
    const pieceType = piece.toLowerCase();
    
    let possibleMoves: Move[] = [];
    switch (pieceType) 
    {
        case 'p':
        {
            possibleMoves = getPawnMoves(position, pieceIndex, isWhite, enPassantTarget);
        } break;
        case 'r':
        {
            possibleMoves = getRookMoves(position, pieceIndex, isWhite);
        } break;
        case 'n':
        {
            possibleMoves = getKnightMoves(position, pieceIndex, isWhite);
        } break;
        case 'b':
        {
            possibleMoves = getBishopMoves(position, pieceIndex, isWhite);
        } break;
        case 'q':
        {
            possibleMoves = getQueenMoves(position, pieceIndex, isWhite);
        } break;
        case 'k':
        {
            possibleMoves = getKingMoves(position, pieceIndex, isWhite, castlingRights);
        } break;
    }
    
    const validMoves = possibleMoves.filter(move => 
    {
        return !wouldLeaveKingInCheck(position, move.from, move.to, isWhite);
    });
    
    return validMoves;
}

function getPawnMoves(
    position: string[], 
    index: number, 
    isWhite: boolean, 
    enPassantTarget: number | null
): Move[] 
{
    const moves: Move[] = [];
    const row = Math.floor(index / 8);
    const col = index % 8;
    const direction = isWhite ? -1 : 1;
    const startRow = isWhite ? 6 : 1;
    const piece = position[index];
    
    const oneForward = index + (direction * 8);
    if (oneForward >= 0 && oneForward < 64 && !position[oneForward]) 
    {
        moves.push({
            from: index,
            to: oneForward,
            piece: piece
        });
        
        if (row === startRow) 
        {
            const twoForward = index + (direction * 16);
            if (twoForward >= 0 && twoForward < 64 && !position[twoForward]) 
            {
                moves.push({
                    from: index,
                    to: twoForward,
                    piece: piece
                });
            }
        }
    }

    const captureLeft = index + (direction * 8) - 1;
    const captureRight = index + (direction * 8) + 1;    
    
    if (captureLeft >= 0 && captureLeft < 64 && col > 0) 
    {
        const targetPiece = position[captureLeft];
        if (targetPiece && isOpponentPiece(targetPiece, isWhite)) 
        {
            moves.push({
                from: index,
                to: captureLeft,
                piece: piece
            });
        }

        if (enPassantTarget === captureLeft) 
        {
            const capturedPawnIndex = row * 8 + (captureLeft % 8);
            moves.push({
                from: index,
                to: captureLeft,
                piece: piece,
                isEnPassant: true,
                affectedPiece: {
                    from: capturedPawnIndex,
                    to: -1
                }
            });
        }
    }
    
    if (captureRight >= 0 && captureRight < 64 && col < 7) 
    {
        const targetPiece = position[captureRight];
        if (targetPiece && isOpponentPiece(targetPiece, isWhite)) 
        {
            moves.push({
                from: index,
                to: captureRight,
                piece: piece
            });
        }

        if (enPassantTarget === captureRight) 
        {
            const capturedPawnIndex = row * 8 + (captureRight % 8);    
            moves.push({
                from: index,
                to: captureRight,
                piece: piece,
                isEnPassant: true,
                affectedPiece: {
                    from: capturedPawnIndex,
                    to: -1
                }
            });
        }
    }
    
    return moves;
}

function getRookMoves(position: string[], index: number, isWhite: boolean): Move[] 
{
    const directions = [
        [-1, 0], [1, 0], [0, -1], [0, 1]
    ];
    
    return getSlidingMoves(position, index, isWhite, directions);
}

function getBishopMoves(position: string[], index: number, isWhite: boolean): Move[] 
{
    const directions = [
        [-1, -1], [-1, 1], [1, -1], [1, 1]
    ];
    
    return getSlidingMoves(position, index, isWhite, directions);
}

function getQueenMoves(position: string[], index: number, isWhite: boolean): Move[] 
{
    const directions = [
        [-1, 0], [1, 0], [0, -1], [0, 1],
        [-1, -1], [-1, 1], [1, -1], [1, 1]
    ];
    
    return getSlidingMoves(position, index, isWhite, directions);
}

function getSlidingMoves(position: string[], index: number, isWhite: boolean, directions: number[][]): Move[] 
{
    const moves: Move[] = [];
    const row = Math.floor(index / 8);
    const col = index % 8;
    const piece = position[index];
    
    for (const [dRow, dCol] of directions) 
    {
        let newRow = row + dRow;
        let newCol = col + dCol;
        
        while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) 
        {
            const newIndex = newRow * 8 + newCol;
            const targetPiece = position[newIndex];
            
            if (!targetPiece) 
            {
                moves.push({
                    from: index,
                    to: newIndex,
                    piece: piece
                });
            } 
            else 
            {
                if (isOpponentPiece(targetPiece, isWhite)) 
                {
                    moves.push({
                        from: index,
                        to: newIndex,
                        piece: piece
                    });
                }
                break;
            }
            
            newRow += dRow;
            newCol += dCol;
        }
    }
    
    return moves;
}

function getKnightMoves(position: string[], index: number, isWhite: boolean): Move[] 
{
    const moves: Move[] = [];
    const row = Math.floor(index / 8);
    const col = index % 8;
    const piece = position[index];
    
    const knightMoves = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    
    for (const [dRow, dCol] of knightMoves) 
    {
        const newRow = row + dRow;
        const newCol = col + dCol;
        
        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) 
        {
            const newIndex = newRow * 8 + newCol;
            const targetPiece = position[newIndex];
            
            if (!targetPiece || isOpponentPiece(targetPiece, isWhite)) 
            {
                moves.push({
                    from: index,
                    to: newIndex,
                    piece: piece
                });
            }
        }
    }
    
    return moves;
}

function getKingMoves(
    position: string[], 
    index: number, 
    isWhite: boolean, 
    castlingRights: GameState["castlingRights"]
): Move[] 
{
    const moves: Move[] = [];
    const row = Math.floor(index / 8);
    const col = index % 8;
    const piece = position[index];
    
    const kingMoves = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1]
    ];
    
    for (const [dRow, dCol] of kingMoves) 
    {
        const newRow = row + dRow;
        const newCol = col + dCol;
        
        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) 
        {
            const newIndex = newRow * 8 + newCol;
            const targetPiece = position[newIndex];
            
            if (!targetPiece || isOpponentPiece(targetPiece, isWhite)) 
            {
                moves.push({
                    from: index,
                    to: newIndex,
                    piece: piece
                });
            }
        }
    }
    
    if (castlingRights) 
    {
        const castlingMoves = getCastlingMoves(position, index, isWhite, castlingRights);
        moves.push(...castlingMoves);
    }
    
    return moves;
}

function getCastlingMoves(
    position: string[], 
    kingIndex: number, 
    isWhite: boolean, 
    castlingRights: GameState["castlingRights"]
): Move[] 
{
    const moves: Move[] = [];
    const row = Math.floor(kingIndex / 8);
    const piece = position[kingIndex];
    
    const expectedRow = isWhite ? 7 : 0;
    if (row !== expectedRow || isSquareUnderAttack(position, kingIndex, !isWhite)) 
    {
        return moves;
    }
    
    const kingsideRight = isWhite ? castlingRights.whiteKingside : castlingRights.blackKingside;
    if (kingsideRight) 
    {
        const f1 = expectedRow * 8 + 5;
        const g1 = expectedRow * 8 + 6;
        const h1 = expectedRow * 8 + 7;
        
        if (!position[f1] && !position[g1] && 
            !isSquareUnderAttack(position, f1, !isWhite) &&
            !isSquareUnderAttack(position, g1, !isWhite)) 
        {
            moves.push({
                from: kingIndex,
                to: g1,
                piece: piece,
                isCastling: true,
                affectedPiece: {
                    from: h1,
                    to: f1
                }
            });
        }
    }
    
    const queensideRight = isWhite ? castlingRights.whiteQueenside : castlingRights.blackQueenside;
    if (queensideRight) 
    {
        const a1 = expectedRow * 8 + 0;
        const b1 = expectedRow * 8 + 1;
        const c1 = expectedRow * 8 + 2;
        const d1 = expectedRow * 8 + 3;
        
        if (!position[b1] && !position[c1] && !position[d1] &&
            !isSquareUnderAttack(position, c1, !isWhite) &&
            !isSquareUnderAttack(position, d1, !isWhite)) 
        {
            moves.push({
                from: kingIndex,
                to: c1,
                piece: piece,
                isCastling: true,
                affectedPiece: {
                    from: a1,
                    to: d1
                }
            });
        }
    }
    
    return moves;
}

function isOpponentPiece(piece: string, isPlayerWhite: boolean): boolean 
{
    const pieceIsWhite = piece === piece.toUpperCase();
    return pieceIsWhite !== isPlayerWhite;
}

function wouldLeaveKingInCheck(
    position: string[], 
    from: number, 
    to: number, 
    isWhite: boolean
): boolean 
{
    const newPosition = [...position];
    const movingPiece = newPosition[from];
    
    if (movingPiece.toLowerCase() === 'p') 
    {
        const fromRow = Math.floor(from / 8);
        const fromCol = from % 8;
        const toCol = to % 8;
        
        if (Math.abs(fromCol - toCol) === 1 && !newPosition[to]) 
        {
            const capturedPawnIndex = fromRow * 8 + toCol;
            newPosition[capturedPawnIndex] = "";
        }
    }
    
    newPosition[to] = movingPiece;
    newPosition[from] = "";
    
    const kingPiece = isWhite ? 'K' : 'k';
    let kingIndex = -1;
    
    for (let i = 0; i < 64; i++) 
    {
        if (newPosition[i] === kingPiece) 
        {
            kingIndex = i;
            break;
        }
    }
    
    if (kingIndex === -1) return true;
    
    return isSquareUnderAttack(newPosition, kingIndex, !isWhite);
}

function isSquareUnderAttack(
    position: string[], 
    targetIndex: number, 
    byWhite: boolean
): boolean 
{
    for (let i = 0; i < 64; i++) 
    {
        const piece = position[i];
        if (!piece) continue;
        
        const pieceIsWhite = piece === piece.toUpperCase();
        if (pieceIsWhite !== byWhite) continue;
        
        const pieceType = piece.toLowerCase();
        switch (pieceType) 
        {
            case 'p':
                if (isPawnAttacking(i, targetIndex, pieceIsWhite)) return true;
                break;
            case 'r':
                if (isRookAttacking(position, i, targetIndex)) return true;
                break;
            case 'n':
                if (isKnightAttacking(i, targetIndex)) return true;
                break;
            case 'b':
                if (isBishopAttacking(position, i, targetIndex)) return true;
                break;
            case 'q':
                if (isQueenAttacking(position, i, targetIndex)) return true;
                break;
            case 'k':
                if (isKingAttacking(i, targetIndex)) return true;
                break;
        }
    }
    
    return false;
}

function isPawnAttacking(
    pawnIndex: number, 
    targetIndex: number, 
    isWhite: boolean
): boolean 
{
    const pawnRow = Math.floor(pawnIndex / 8);
    const pawnCol = pawnIndex % 8;
    const targetRow = Math.floor(targetIndex / 8);
    const targetCol = targetIndex % 8;
    
    const direction = isWhite ? -1 : 1;
    const expectedRow = pawnRow + direction;
    
    return targetRow === expectedRow && Math.abs(targetCol - pawnCol) === 1;
}

function isRookAttacking(
    position: string[], 
    rookIndex: number, 
    targetIndex: number
): boolean 
{
    const rookRow = Math.floor(rookIndex / 8);
    const rookCol = rookIndex % 8;
    const targetRow = Math.floor(targetIndex / 8);
    const targetCol = targetIndex % 8;
    
    // Must be on same rank or file
    if (rookRow !== targetRow && rookCol !== targetCol) return false;
    
    return isPathClear(position, rookIndex, targetIndex);
}

function isBishopAttacking(
    position: string[], 
    bishopIndex: number, 
    targetIndex: number
): boolean 
{
    const bishopRow = Math.floor(bishopIndex / 8);
    const bishopCol = bishopIndex % 8;
    const targetRow = Math.floor(targetIndex / 8);
    const targetCol = targetIndex % 8;
    
    // Must be on diagonal
    if (Math.abs(bishopRow - targetRow) !== Math.abs(bishopCol - targetCol)) return false;
    
    return isPathClear(position, bishopIndex, targetIndex);
}

function isQueenAttacking(
    position: string[], 
    queenIndex: number, 
    targetIndex: number
): boolean 
{
    return isRookAttacking(position, queenIndex, targetIndex) || 
           isBishopAttacking(position, queenIndex, targetIndex);
}

function isKnightAttacking(
    knightIndex: number, 
    targetIndex: number
): boolean 
{
    const knightRow = Math.floor(knightIndex / 8);
    const knightCol = knightIndex % 8;
    const targetRow = Math.floor(targetIndex / 8);
    const targetCol = targetIndex % 8;
    
    const rowDiff = Math.abs(knightRow - targetRow);
    const colDiff = Math.abs(knightCol - targetCol);
    
    return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
}

function isKingAttacking(
    kingIndex: number, 
    targetIndex: number
): boolean 
{
    const kingRow = Math.floor(kingIndex / 8);
    const kingCol = kingIndex % 8;
    const targetRow = Math.floor(targetIndex / 8);
    const targetCol = targetIndex % 8;
    
    const rowDiff = Math.abs(kingRow - targetRow);
    const colDiff = Math.abs(kingCol - targetCol);
    
    return rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0);
}

function isPathClear(position: string[], from: number, to: number): boolean 
{
    const fromRow = Math.floor(from / 8);
    const fromCol = from % 8;
    const toRow = Math.floor(to / 8);
    const toCol = to % 8;
    
    const rowDir = toRow > fromRow ? 1 : toRow < fromRow ? -1 : 0;
    const colDir = toCol > fromCol ? 1 : toCol < fromCol ? -1 : 0;
    
    let currentRow = fromRow + rowDir;
    let currentCol = fromCol + colDir;
    
    while (currentRow !== toRow || currentCol !== toCol) 
    {
        const currentIndex = currentRow * 8 + currentCol;
        if (position[currentIndex]) return false;
        
        currentRow += rowDir;
        currentCol += colDir;
    }
    
    return true;
}

export function isCheckmate(
    position: string[], 
    isWhiteToMove: boolean, 
    enPassantTarget: number | null,
    castlingRights: CastlingRights
): boolean 
{
    if (!isInCheck(position, isWhiteToMove)) 
    {
        return false;
    }

    return !hasLegalMoves(position, isWhiteToMove, enPassantTarget, castlingRights);
}

export function isStalemate(
    position: string[], 
    isWhiteToMove: boolean, 
    enPassantTarget: number | null,
    castlingRights: CastlingRights
): boolean 
{
    if (isInCheck(position, isWhiteToMove)) 
    {
        return false;
    }
    
    return !hasLegalMoves(position, isWhiteToMove, enPassantTarget, castlingRights);
}

export function isInCheck(position: string[], isWhitePlayer: boolean): boolean 
{
    const kingPiece = isWhitePlayer ? 'K' : 'k';
    let kingIndex = -1;
    
    for (let i = 0; i < 64; i++) 
    {
        if (position[i] === kingPiece) 
        {
            kingIndex = i;
            break;
        }
    }
    
    if (kingIndex === -1) return false;
    return isSquareUnderAttack(position, kingIndex, !isWhitePlayer);
}

export function hasLegalMoves(
    position: string[], 
    isWhiteToMove: boolean, 
    enPassantTarget: number | null,
    castlingRights: CastlingRights
): boolean 
{
    for (let i = 0; i < 64; i++) 
    {
        const piece = position[i];
        if (!piece) continue;
        
        const pieceIsWhite = piece === piece.toUpperCase();
        if (pieceIsWhite !== isWhiteToMove) continue;
        
        const validMoves = getValidMoves(position, i, enPassantTarget, castlingRights);
        if (validMoves.length > 0) 
        {
            return true;
        }
    }
    
    return false;
}

export function updateEnPassantTarget(from: number, to: number, piece: string): number | null 
{
    let enPassantTarget: number | null = null;
    
    if (piece.toLowerCase() === 'p') 
    {
        const fromRow = Math.floor(from / 8);
        const toRow = Math.floor(to / 8);
        
        if (Math.abs(fromRow - toRow) === 2) 
        {
            enPassantTarget = from + (to - from) / 2;
        }
    }
    
    return enPassantTarget;
}