import { BrainCircuitSvg } from "../svgs/Svgs";
import { ModalContent, ModalFooter } from "../modal/Modal";
import { ModalHeader } from "../modal/Modal";
import Modal from "../modal/Modal";
import { BrainSvg } from "../svgs/Svgs";
import Button from "../button/Button";
import { GameMode, PlayerType, type Players } from "../../types.d";
import { useCallback, useState } from "react";
import { twMerge } from "tailwind-merge";
import Select from "../select/Select";
import { Models } from "../../helpers/aisdk";
import { useGameStore } from "../../store/store";
import type { Color } from "chess.js";

const modes = [
    {
        mode: GameMode.HumanVsAI,
        label: "Play vs AI",
        icon: (
            <>
                <BrainSvg className="w-6 h-6" />
                <span className="text-xs font-medium text-neutral-500">VS</span>
                <BrainCircuitSvg className="w-6 h-6" />
            </>
        )
    },
    {
        mode: GameMode.AIVsAI,
        label: "AI vs AI",
        icon: (
            <>
                <BrainCircuitSvg className="w-6 h-6" />
                <span className="text-xs font-medium text-neutral-500">VS</span>
                <BrainCircuitSvg className="w-6 h-6" />
            </>
        )
    }
]

const models = Models.map((model) =>
{
    return {
        value: model.id,
        label: model.name
    }
});

function NewGameModal(props: {
    open: boolean;
    onClose: () => void;
})
{
    const { startGame } = useGameStore();
    const [gameMode, setLocalGameMode] = useState<GameMode>(GameMode.HumanVsAI);
    const [model1, setModel1] = useState<string>(models[0].value);
    const [model2, setModel2] = useState<string>(models[0].value);
    const [pieceColor, setPieceColor] = useState<string>("b");

    const handleGameModeChange = (mode: GameMode) =>
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

        let playingAs: Color = "w";
        const ai1 = Models.find((model) => model.id === model1);
        if (gameMode === GameMode.HumanVsAI)
        {
            if (pieceColor === "w")
            {
                players.white.type = PlayerType.AI;
                players.white.model = ai1;
                playingAs = "b";
            }
            else
            {
                players.black.type = PlayerType.AI;
                players.black.model = ai1;
                playingAs = "w";
            }
        }
        else
        {
            const ai2 = Models.find((model) => model.id === model2);
            players.white.type = PlayerType.AI;
            players.white.model = ai1;
            players.black.type = PlayerType.AI;
            players.black.model = ai2;
        }

        startGame(players, gameMode, playingAs);
        props.onClose();
    }, [model1, model2, pieceColor, gameMode, startGame]);

    return (
        <Modal open={props.open}>
            <ModalHeader title="New Game" onClose={props.onClose} />
            <ModalContent className="p-6">
                <div className="flex gap-3">
                    {
                        modes.map((mode) => (
                            <div
                                key={mode.mode}
                                className={
                                    twMerge(
                                        "flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-xl border cursor-pointer transition-all duration-150",
                                        gameMode === mode.mode
                                            ? "bg-white/10 border-blue-500/40 text-white"
                                            : "bg-white/[0.03] border-white/[0.06] text-neutral-400 hover:bg-white/[0.06] hover:text-white"
                                    )
                                }
                                onClick={() => handleGameModeChange(mode.mode)}
                            >
                                <div className="flex items-center gap-2">
                                    {mode.icon}
                                </div>
                                <span className="text-xs font-medium">{mode.label}</span>
                            </div>
                        ))
                    }
                </div>
                {
                    gameMode === GameMode.HumanVsAI && (
                        <div className="mt-6">
                            <span className="text-sm font-medium text-neutral-400">Play Against</span>
                            <Select
                                className="mt-1"
                                options={models}
                                label="Model"
                                value={model1}
                                onChange={handleModel1Change}
                            />
                            <Select
                                options={[ { value: "b", label: "Black" }, { value: "w", label: "White" }]}
                                label="Piece"
                                value={pieceColor}
                                onChange={handlePieceColorChange}
                            />
                        </div>
                    )
                }
                {
                    gameMode === GameMode.AIVsAI && (
                        <div className="mt-6">
                            <div className="flex flex-col gap-1">
                                <span className="text-sm font-medium text-neutral-400">White Pieces</span>
                                <Select
                                    className="mt-0"
                                    options={models}
                                    label="Model"
                                    value={model1}
                                    onChange={handleModel1Change}
                                />
                            </div>
                            <div className="mt-4 flex flex-col gap-1">
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
                    Play
                </Button>
            </ModalFooter>
        </Modal>
    )
}

export default NewGameModal;
