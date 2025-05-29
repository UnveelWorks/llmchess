import { BrainCircuitSvg } from "../svgs/Svgs";
import { ModalContent, ModalFooter } from "../modal/Modal";
import { ModalHeader } from "../modal/Modal";
import Modal from "../modal/Modal";
import { BrainSvg } from "../svgs/Svgs";
import Button from "../button/Button";
import { useGame } from "../../context/GameProvider";
import { GameModes, PlayerType, type Players } from "../../types.d";
import { useCallback, useState } from "react";
import { twMerge } from "tailwind-merge";
import Select from "../select/Select";
import { Models } from "../../helpers/aisdk";

const modes = [
    {
        mode: GameModes.HumanVsAi,
        icon: (
            <>
                <BrainSvg className="w-6 h-6" />
                <span className="text-sm font-medium">VS</span>
                <BrainCircuitSvg className="w-6 h-6" />
            </>
        )
    },
    {
        mode: GameModes.AiVsAi,
        icon: (
            <>
                <BrainCircuitSvg className="w-6 h-6" />
                <span className="text-sm font-medium">VS</span>
                <BrainCircuitSvg className="w-6 h-6" />
            </>
        )
    }
]

const models = Models.map((model) => 
{ 
    const provider = model.provider.charAt(0).toUpperCase() + model.provider.slice(1);
    return {
        value: model.id,
        label: `${provider} ${model.name}`
    }
});

function NewGameModal()
{
    const { 
        newGameModalOpen, 
        setNewGameModalOpen, 
        setGameMode, 
        setIsPlaying,
        setPlayers
    } = useGame();
    const [gameMode, setLocalGameMode] = useState<GameModes>(GameModes.HumanVsAi);
    const [model1, setModel1] = useState<string>(models[0].value);
    const [model2, setModel2] = useState<string>(models[0].value);
    const [pieceColor, setPieceColor] = useState<string>("black");

    const handleNewGameClose = () => 
    {
        setNewGameModalOpen(false);
    }

    const handleGameModeChange = (mode: GameModes) => 
    {
        setLocalGameMode(mode);
    }

    const handleModel1Change = (e: React.ChangeEvent<HTMLSelectElement>) => 
    {
        setModel1(e.target.value);
    }

    const handlePieceColorChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    {
        setPieceColor(e.target.value);
    }

    const handleModel2Change = (e: React.ChangeEvent<HTMLSelectElement>) =>
    {
        setModel2(e.target.value);
    }

    const start = useCallback(() =>
    {
        const players: Players = {
            white: {
                type: PlayerType.Human,
            },
            black: {
                type: PlayerType.Human,
            }
        }

        const ai1 = Models.find((model) => model.id === model1);
        if (gameMode === GameModes.HumanVsAi)
        {
            if (pieceColor === "white")
            {
                players.white.type = PlayerType.Ai;
                players.white.model = ai1;
            }
            else
            {
                players.black.type = PlayerType.Ai;
                players.black.model = ai1;
            }
        }
        else 
        {
            const ai2 = Models.find((model) => model.id === model2);
            players.white.type = PlayerType.Ai;
            players.white.model = ai1;
            players.black.type = PlayerType.Ai;
            players.black.model = ai2;
        }

        console.log(players);

        setPlayers(players);
        setGameMode(gameMode);
        setIsPlaying(true);
        setNewGameModalOpen(false);
    }, [model1, model2, pieceColor, gameMode]);

    return (
        <Modal open={newGameModalOpen} className="absolute z-1">
            <ModalHeader title="New Game" onClose={handleNewGameClose} />
            <ModalContent className="p-6">
                <div className="h-14 flex border border-white/10 rounded-md cursor-pointer overflow-hidden">
                    {
                        modes.map((mode) => (
                            <div 
                                key={mode.mode}
                                className={
                                    twMerge(
                                        "flex-1 flex items-center justify-center gap-2 border-white/10 hover:bg-white/5 transition-colors duration-150 text-neutral-300 hover:text-white",
                                        gameMode === mode.mode && "bg-white/10 text-white hover:bg-white/10"
                                    )
                                }
                                onClick={() => handleGameModeChange(mode.mode)}
                            >
                                {
                                    mode.icon
                                }
                            </div>
                        ))
                    }
                </div>
                {
                    gameMode === GameModes.HumanVsAi && (
                        <div  className="mt-6">
                            <Select
                                options={models} 
                                label="Model" 
                                value={model1}
                                onChange={handleModel1Change}
                            />
                            <Select
                                options={[ { value: "black", label: "Black" }, { value: "white", label: "White" }]}
                                label="Piece"
                                value={pieceColor}
                                onChange={handlePieceColorChange}
                            />
                        </div>
                    )
                }
                {
                    gameMode === GameModes.AiVsAi && (
                        <div className="mt-6">
                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-medium text-neutral-400">White Pieces</span>
                                <Select 
                                    className="mt-0" 
                                    options={models} 
                                    label="Model" 
                                    value={model1}
                                    onChange={handleModel1Change}
                                />
                            </div>
                            <div className="mt-4 flex flex-col gap-2">
                                <span className="text-sm font-medium text-neutral-400">Black Pieces</span>
                                <Select 
                                    className="mt-0" 
                                    options={models} 
                                    label="Model" 
                                    value={model2}
                                    onChange={handleModel2Change}
                                />
                            </div>
                        </div>
                    )
                }
            </ModalContent>
            <ModalFooter>
                <Button theme="blue" type="medium" onClick={start}>
                    Start
                </Button>
            </ModalFooter>
        </Modal>
    )
}

export default NewGameModal;