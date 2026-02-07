'use strict';
import { generateText, tool, stepCountIs, type LanguageModelUsage, type ModelMessage } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { tryCatch } from "./tryCatch";
import { z } from "zod";

export namespace NAISDK
{
    export interface ApiKeys {
        openrouter: string;
    }

    export interface Model {
        id: string;
        name: string;
        version: string;
    }

    export interface Response {
        text: string;
        usage: LanguageModelUsage;
    }

    export type Role = "user" | "assistant" | "system";

    export interface AgenticMoveResult {
        move: string;
        offerDraw: boolean;
        resign: boolean;
        usage: LanguageModelUsage;
        steps: number;
    }
}

const Models:  NAISDK.Model[] = [
    // OpenAI
    {
        id: "gpt-5.2",
        name: "OpenAI GPT-5.2",
        version: "openai/gpt-5.2",
    },
    {
        id: "gpt-5.1",
        name: "OpenAI GPT-5.1",
        version: "openai/gpt-5.1",
    },
    {
        id: "gpt-5",
        name: "OpenAI GPT-5",
        version: "openai/gpt-5",
    },
    {
        id: "gpt-5-mini",
        name: "OpenAI GPT-5 Mini",
        version: "openai/gpt-5-mini",
    },
    {
        id: "o3",
        name: "OpenAI o3",
        version: "openai/o3",
    },
    {
        id: "o4-mini",
        name: "OpenAI o4 Mini",
        version: "openai/o4-mini",
    },
    {
        id: "gpt-4.1",
        name: "OpenAI GPT-4.1",
        version: "openai/gpt-4.1",
    },
    {
        id: "gpt-4.1-mini",
        name: "OpenAI GPT-4.1 Mini",
        version: "openai/gpt-4.1-mini",
    },
    {
        id: "gpt-5.2-codex",
        name: "OpenAI GPT-5.2 Codex",
        version: "openai/gpt-5.2-codex",
    },
    {
        id: "gpt-5.1-codex",
        name: "OpenAI GPT-5.1 Codex",
        version: "openai/gpt-5.1-codex",
    },
    {
        id: "gpt-5.1-codex-max",
        name: "OpenAI GPT-5.1 Codex Max",
        version: "openai/gpt-5.1-codex-max",
    },
    {
        id: "gpt-5.1-codex-mini",
        name: "OpenAI GPT-5.1 Codex Mini",
        version: "openai/gpt-5.1-codex-mini",
    },
    {
        id: "gpt-5-codex",
        name: "OpenAI GPT-5 Codex",
        version: "openai/gpt-5-codex",
    },

    // Anthropic
    {
        id: "claude-opus-4.6",
        name: "Anthropic Claude Opus 4.6",
        version: "anthropic/claude-opus-4.6",
    },
    {
        id: "claude-sonnet-4.5",
        name: "Anthropic Claude Sonnet 4.5",
        version: "anthropic/claude-sonnet-4.5",
    },
    {
        id: "claude-opus-4",
        name: "Anthropic Claude Opus 4",
        version: "anthropic/claude-opus-4",
    },
    {
        id: "claude-sonnet-4",
        name: "Anthropic Claude Sonnet 4",
        version: "anthropic/claude-sonnet-4",
    },
    {
        id: "claude-3.5-haiku",
        name: "Anthropic Claude 3.5 Haiku",
        version: "anthropic/claude-3.5-haiku",
    },

    // Google
    {
        id: "gemini-3-pro-preview",
        name: "Google Gemini 3 Pro Preview",
        version: "google/gemini-3-pro-preview",
    },
    {
        id: "gemini-3-flash-preview",
        name: "Google Gemini 3 Flash Preview",
        version: "google/gemini-3-flash-preview",
    },
    {
        id: "gemini-2.5-pro",
        name: "Google Gemini 2.5 Pro",
        version: "google/gemini-2.5-pro",
    },
    {
        id: "gemini-2.5-flash",
        name: "Google Gemini 2.5 Flash",
        version: "google/gemini-2.5-flash",
    },
    {
        id: "gemini-2.5-flash-lite",
        name: "Google Gemini 2.5 Flash Lite",
        version: "google/gemini-2.5-flash-lite",
    },
    {
        id: "gemini-2.0-flash",
        name: "Google Gemini 2.0 Flash",
        version: "google/gemini-2.0-flash",
    },

    // MoonshotAI
    {
        id: "kimi-k2.5",
        name: "MoonshotAI Kimi K2.5",
        version: "moonshotai/kimi-k2.5",
    },
    {
        id: "kimi-k2",
        name: "MoonshotAI Kimi K2",
        version: "moonshotai/kimi-k2",
    },
    {
        id: "kimi-dev-72b",
        name: "MoonshotAI Kimi Dev 72B",
        version: "moonshotai/kimi-dev-72b",
    },
];

function getModel(id: string): NAISDK.Model
{
    const model = Models.find(model => model.id === id);
    if (!model) console.log(`Model ${id} not found, defaulting to ${Models[0].name}`);
    return model || Models[0];
}

class AISDK 
{
    private apiKeys: NAISDK.ApiKeys;

    constructor(apiKeys: NAISDK.ApiKeys)
    {
        this.apiKeys = apiKeys;
    }

    generateText = async (
        model: NAISDK.Model, 
        messages: ModelMessage[]
    ): Promise<NAISDK.Response> =>
    {
        const openrouter = createOpenRouter({
            apiKey: this.apiKeys.openrouter,
        });
        
        const { data: result, error } = await tryCatch(generateText({
            model: openrouter.chat(model.version),
            messages
        }));

        if (error)
        {
            console.log(error);
            throw new Error(error.message);   
        }

        const { text, usage } = result;
        return {
            text, 
            usage
        };
    }

    generateAgenticMove = async (
        model: NAISDK.Model,
        systemPrompt: string,
        fen: string,
        turn: string,
        getLegalMovesFn: () => string[],
        isLegalMoveFn: (san: string) => boolean,
        maxSteps: number
    ): Promise<NAISDK.AgenticMoveResult> =>
    {
        const openrouter = createOpenRouter({
            apiKey: this.apiKeys.openrouter,
        });

        const makeMoveResultSchema = z.object({
            success: z.boolean(),
            move: z.string().optional(),
            offerDraw: z.boolean().optional(),
            resign: z.boolean().optional(),
            error: z.string().optional(),
            legalMoves: z.array(z.string()).optional(),
        });

        type MakeMoveResult = z.infer<typeof makeMoveResultSchema>;

        const tools = {
            get_legal_moves: tool({
                description: "Get the current board position (FEN), whose turn it is, and all legal moves in standard algebraic notation (SAN).",
                inputSchema: z.object({}),
                execute: async () => ({
                    fen,
                    turn,
                    moves: getLegalMovesFn(),
                }),
            }),
            make_move: tool({
                description: "Submit a chess move in standard algebraic notation (SAN). The move will be validated against the current position. If invalid, an error with the list of legal moves is returned.",
                inputSchema: z.object({
                    move: z.string().describe("The move in SAN notation (e.g. 'Nf3', 'e4', 'O-O')"),
                    offerDraw: z.boolean().describe("Whether to offer a draw along with this move"),
                    resign: z.boolean().describe("Whether to resign instead of making a move"),
                }),
                execute: async ({ move, offerDraw, resign }): Promise<MakeMoveResult> => {
                    if (resign) {
                        return { success: true, move: "", offerDraw: false, resign: true };
                    }
                    if (isLegalMoveFn(move)) {
                        return { success: true, move, offerDraw, resign: false };
                    }
                    return {
                        success: false,
                        error: `"${move}" is not a legal move in this position.`,
                        legalMoves: getLegalMovesFn(),
                    };
                },
            }),
        };

        const { data: result, error } = await tryCatch(generateText({
            model: openrouter.chat(model.version),
            system: systemPrompt,
            prompt: `It is ${turn}'s turn. The current FEN is: ${fen}\n\nUse the get_legal_moves tool to see available moves, then use make_move to submit your chosen move.`,
            tools,
            stopWhen: [
                ({ steps }) => {
                    for (let i = steps.length - 1; i >= 0; i--) {
                        for (const tr of steps[i].toolResults) {
                            if (
                                tr.toolName === "make_move" &&
                                typeof tr.output === "object" &&
                                tr.output !== null &&
                                (tr.output as MakeMoveResult).success === true
                            ) {
                                return true;
                            }
                        }
                    }
                    return false;
                },
                stepCountIs(maxSteps),
            ],
        }));

        if (error) {
            console.log(error);
            throw new Error(error.message);
        }

        // Find the successful make_move result
        for (let i = result.steps.length - 1; i >= 0; i--) {
            for (const toolResult of result.steps[i].toolResults) {
                if (toolResult.toolName === "make_move") {
                    const res = toolResult.output as MakeMoveResult;
                    if (res.success) {
                        console.log(`AI completed in ${result.steps.length} step(s)`);
                        return {
                            move: res.move || "",
                            offerDraw: res.offerDraw || false,
                            resign: res.resign || false,
                            usage: result.totalUsage,
                            steps: result.steps.length,
                        };
                    }
                }
            }
        }

        throw new Error("AI did not produce a valid move within the step limit");
    }
}

export default AISDK;
export { Models, getModel };