import { createContext, useContext, useState } from "react";
import type { GameState } from "../types";
import defaultPosition from "../data/defaultPosition";

export interface GameContextType {
    game: GameState;
    setGame: React.Dispatch<React.SetStateAction<GameState>>;
}

export const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => 
{
    const context = useContext(GameContext);
    if (!context) 
    {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
};

export const GameProvider = ({ children }: { children: React.ReactNode }) => 
{
    const [game, setGame] = useState<GameState>({
        position: [...defaultPosition.white],
        turn: "white",
        playingAs: "black",
        enPassantTarget: null,
        castlingRights: {
            whiteKingside: true,
            whiteQueenside: true,
            blackKingside: true,
            blackQueenside: true
        },
        moveHistory: []
    });

    const value = {
        game,
        setGame
    };

    return (
        <GameContext.Provider value={value}>
            { children }
        </GameContext.Provider>
    );
};