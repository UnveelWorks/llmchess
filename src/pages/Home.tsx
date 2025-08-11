import Container from "../components/container/Container";
import Board from "../components/board/Board";
import GameInfo from "../components/game_info/GameInfo";
import { getFen, useSettingsStore, useGameStore } from "../store/store";
import { useCallback, useEffect, useRef } from "react";
import { GameMode } from "../types.d";
import type { NAISDK } from "../helpers/aisdk";
import AISDK from "../helpers/aisdk";
import Prompts from "../data/prompts";
import z from "zod";
import { tryCatch } from "../helpers/tryCatch";
import toast from "react-hot-toast";
import type { Color } from "chess.js";

const RESPONSE_SCHEMA = z.object({
    move: z.string(),
    offerDraw: z.boolean(),
    resign: z.boolean(),
});

function Home()
{
    const { game, movePiece } = useGameStore();
    const { apiKeys, prompts } = useSettingsStore();
    const lastTurn = useRef<Color>("w");
    const previousInvalidMoves = useRef<string[]>([]);

    const isAiMove = useCallback(() => 
    {
        let isAiMove = false, model: NAISDK.Model | null = null;
        if (game.mode === GameMode.HumanVsAI && game.turn !== game.playingAs)
        {
            isAiMove = true;
            model = game.playingAs === "w" ? game.players.black.model! : game.players.white.model!;
        }
        else if (game.mode === GameMode.AIVsAI)
        {
            isAiMove = true;
            model = game.turn === "w" ? game.players.white.model! : game.players.black.model!;
        }

        return { status: isAiMove, model };
    }, 
    [game.mode, game.turn, game.playingAs, game.players]);

    const getAiMove = useCallback(async (model: NAISDK.Model, retry: boolean = false) => 
    {
        const ai = new AISDK(apiKeys);
        const fen = getFen();
        const prompt = retry 
            ? Prompts.generatePrompt(
                prompts.moveCorrection, 
                {
                    FEN: fen,
                    TURN: game.turn === "w" ? "white" : "black",
                    PREVIOUS_INVALID_MOVES: JSON.stringify(previousInvalidMoves.current)
                }
            )
            : Prompts.generatePrompt(
                prompts.moveGeneration, 
                {
                    FEN: fen,
                    TURN: game.turn === "w" ? "white" : "black"
                }
            );


        console.log(`${game.turn === "w" ? "White" : "Blacks"}'s Turn: ${model.name}`);
        console.log(retry ? "Correcting move..." : "Generating move...");

        const { data: response, error } = await tryCatch(ai.generateObject(
            model,
            prompt,
            RESPONSE_SCHEMA
        ));

        if (error)
        {
            toast.error("Move generation failed: " + error.message);
            console.log("Move generation failed: ", error);
            return;
        }

        console.log("Move: ", response.object);

        move(response.object.move);
    }, 
    [apiKeys, prompts, game.turn, getFen]);

    const move = useCallback((move: string) => 
    {
        const { status, model } = isAiMove();
        try
        {
            movePiece(move);
            if (status) previousInvalidMoves.current = [];
        }
        catch (err: any)
        {
            if (!status) return;
            console.log("Invalid move: ", err);
            if (!previousInvalidMoves.current.includes(move)) previousInvalidMoves.current.push(move);
            getAiMove(model!, true);
        }
    }, 
    [isAiMove]);

    useEffect(() => 
    {
        if (!game.playing && lastTurn.current === game.turn) return;
        const { status, model } = isAiMove();
        if (status) getAiMove(model!, false);
        lastTurn.current = game.turn;
    }, 
    [game.playing, game.turn, getAiMove, isAiMove]);

    return (
        <section className="relative py-6 flex-1 flex flex-col min-h-0 overflow-hidden">
            <Container className="flex-1 flex flex-row justify-center gap-2 min-h-0 overflow-hidden">
                <GameInfo />
                <div className="flex flex-col items-start justify-start min-h-0 overflow-hidden">
                    <Board move={move}/>
                </div>
            </Container>
        </section>
    )
}

export default Home;