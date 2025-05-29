import { createContext, useContext, useState } from "react";
import { GameModes, type GameState, type Players } from "../types.d";
import defaultPosition from "../data/defaultPosition";

export interface GameContextType {
    isPlaying: boolean;
    newGameModalOpen: boolean;
    gameMode: GameModes;
    players: Players | null;
    game: GameState;
    setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
    setGame: React.Dispatch<React.SetStateAction<GameState>>;
    setNewGameModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setGameMode: React.Dispatch<React.SetStateAction<GameModes>>;
    setPlayers: React.Dispatch<React.SetStateAction<Players | null>>;
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
    const [isPlaying, setIsPlaying] = useState(false);
    const [newGameModalOpen, setNewGameModalOpen] = useState(false);
    const [gameMode, setGameMode] = useState<GameModes>(GameModes.HumanVsAi);
    const [players, setPlayers] = useState<Players | null>(null);
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
        isPlaying,
        newGameModalOpen,
        game,
        gameMode,
        players,
        setGame,
        setIsPlaying,
        setNewGameModalOpen,
        setGameMode,
        setPlayers
    };

    return (
        <GameContext.Provider value={value}>
            { children }
        </GameContext.Provider>
    );
};