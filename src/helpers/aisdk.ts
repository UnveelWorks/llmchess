'use strict';
import { generateText, generateObject, tool, stepCountIs, type LanguageModelUsage, type ModelMessage } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { tryCatch } from "./tryCatch";
import Prompts from "../data/prompts";
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
        tries: number;
    }
}

const Models: NAISDK.Model[] = [
    // OpenAI
    {
        id: "gpt-5.4",
        name: "OpenAI GPT-5.4",
        version: "openai/gpt-5.4",
    },
    {
        id: "gpt-5.4-pro",
        name: "OpenAI GPT-5.4 Pro",
        version: "openai/gpt-5.4-pro",
    },
    {
        id: "gpt-5.3",
        name: "OpenAI GPT-5.3",
        version: "openai/gpt-5.3",
    },
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

    // Anthropic
    {
        id: "claude-opus-4.6",
        name: "Anthropic Claude Opus 4.6",
        version: "anthropic/claude-opus-4.6",
    },
    {
        id: "claude-sonnet-4.6",
        name: "Anthropic Claude Sonnet 4.6",
        version: "anthropic/claude-sonnet-4.6",
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
        id: "claude-haiku-4.5",
        name: "Anthropic Claude Haiku 4.5",
        version: "anthropic/claude-haiku-4.5",
    },
    {
        id: "claude-3.5-haiku",
        name: "Anthropic Claude 3.5 Haiku",
        version: "anthropic/claude-3.5-haiku",
    },

    // Google
    {
        id: "gemini-3.1-pro-preview",
        name: "Google Gemini 3.1 Pro Preview",
        version: "google/gemini-3.1-pro-preview",
    },
    {
        id: "gemini-3.1-flash-lite-preview",
        name: "Google Gemini 3.1 Flash Lite Preview",
        version: "google/gemini-3.1-flash-lite-preview",
    },
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

    // Minimax
    {
        id: "minimax-m2.5",
        name: "Minimax M2.5",
        version: "minimax/minimax-m2.5",
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

// Internal result type shared across tool handlers
interface ToolMoveResult {
    success: boolean;
    move?: string;
    offerDraw?: boolean;
    resign?: boolean;
    error?: string;
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
        return { text, usage };
    }

    /**
     * Build constrained tool definitions for the current position.
     * 
     * Key improvements over the original:
     * - move field uses z.enum(legalMoves) so models structurally cannot hallucinate moves
     * - strict: true enables provider-level schema enforcement where supported
     * - resign and offer_draw are separate tools to reduce schema complexity on make_move
     * - descriptions include concrete examples to guide weaker models
     */
    private buildTools = (
        fen: string,
        turn: string,
        legalMoves: string[],
        getLegalMovesFn: () => string[],
        isLegalMoveFn: (san: string) => boolean,
    ) =>
    {
        // Enum constraint: the model literally cannot output an invalid move string
        // when the provider supports strict mode
        const moveEnum = legalMoves.length > 0
            ? z.enum(legalMoves as [string, ...string[]])
            : z.string().describe("Move in SAN notation");

        return {
            get_legal_moves: tool({
                description: "Get the current board state (FEN), whose turn it is, and all legal moves in Standard Algebraic Notation (SAN). Call this if you need to verify the position before making a move.",
                inputSchema: z.object({}),
                strict: true,
                execute: async () =>
                {
                    const moves = getLegalMovesFn();
                    console.log(`[AI Debug] get_legal_moves called → ${moves.length} moves`);
                    return { fen, turn, moves };
                },
            }),

            make_move: tool({
                description: [
                    "Play a chess move.",
                    "The 'move' parameter MUST be exactly one of the legal moves in SAN notation.",
                    "Examples: make_move({ move: 'Nf3' }), make_move({ move: 'e4' }), make_move({ move: 'O-O' }).",
                ].join(" "),
                inputSchema: z.object({
                    move: moveEnum.describe("The move to play — must be from the legal moves list"),
                }),
                strict: true,
                execute: async ({ move }): Promise<ToolMoveResult> =>
                {
                    console.log(`[AI Debug] make_move called: move="${move}"`);
                    if (isLegalMoveFn(move))
                    {
                        console.log(`[AI Debug] → Move "${move}" is legal ✓`);
                        return { success: true, move, offerDraw: false, resign: false };
                    }
                    // This branch should rarely trigger with enum constraint,
                    // but keeps safety for models that ignore strict mode
                    const currentMoves = getLegalMovesFn();
                    console.log(`[AI Debug] → Move "${move}" is ILLEGAL ✗`);
                    return {
                        success: false,
                        error: `"${move}" is not legal. Legal moves: ${currentMoves.join(", ")}. Pick one and call make_move again.`,
                    };
                },
            }),

            resign: tool({
                description: "Resign the game. Only use this if the position is completely hopeless and you have no reasonable chances.",
                inputSchema: z.object({}),
                strict: true,
                execute: async (): Promise<ToolMoveResult> =>
                {
                    console.log("[AI Debug] → Resign accepted");
                    return { success: true, move: "", offerDraw: false, resign: true };
                },
            }),

            offer_draw: tool({
                description: "Offer a draw while making a move. Only use this when the position is roughly equal. You must still specify a move to play.",
                inputSchema: z.object({
                    move: moveEnum.describe("The move to play along with the draw offer"),
                }),
                strict: true,
                execute: async ({ move }): Promise<ToolMoveResult> =>
                {
                    console.log(`[AI Debug] offer_draw called: move="${move}"`);
                    if (isLegalMoveFn(move))
                    {
                        console.log(`[AI Debug] → Draw offered with move "${move}" ✓`);
                        return { success: true, move, offerDraw: true, resign: false };
                    }
                    const currentMoves = getLegalMovesFn();
                    console.log(`[AI Debug] → Move "${move}" is ILLEGAL ✗`);
                    return {
                        success: false,
                        error: `"${move}" is not legal. Legal moves: ${currentMoves.join(", ")}. Pick one and call offer_draw again.`,
                    };
                },
            }),
        };
    }

    /**
     * Check all steps for a successful tool result (make_move, resign, or offer_draw).
     */
    private extractSuccessResult = (
        steps: Array<{ toolResults: Array<{ toolName: string; output: unknown }> }>
    ): { result: ToolMoveResult | null; tries: number } =>
    {
        let tries = 0;
        let successResult: ToolMoveResult | null = null;

        for (const step of steps)
        {
            for (const toolResult of step.toolResults)
            {
                const isMoveTool = toolResult.toolName === "make_move"
                    || toolResult.toolName === "resign"
                    || toolResult.toolName === "offer_draw";

                if (isMoveTool)
                {
                    tries++;
                    const res = toolResult.output as ToolMoveResult;
                    if (res.success) successResult = res;
                }
            }
        }

        return { result: successResult, tries };
    }

    generateAgenticMove = async (
        model: NAISDK.Model,
        systemPrompt: string,
        fen: string,
        turn: string,
        getLegalMovesFn: () => string[],
        isLegalMoveFn: (san: string) => boolean,
        maxSteps: number,
        abortSignal?: AbortSignal
    ): Promise<NAISDK.AgenticMoveResult> =>
    {
        const openrouter = createOpenRouter({
            apiKey: this.apiKeys.openrouter,
        });

        const legalMoves = getLegalMovesFn();
        const tools = this.buildTools(fen, turn, legalMoves, getLegalMovesFn, isLegalMoveFn);
        const prompt = Prompts.buildMovePrompt(fen, turn, legalMoves);

        console.log("[AI Debug] System prompt:", systemPrompt);
        console.log("[AI Debug] User prompt:", prompt);
        console.log("[AI Debug] Max steps:", maxSteps * 3);
        console.log("[AI Debug] Legal moves count:", legalMoves.length);

        // --- Primary path: agentic tool calling with enum constraints ---
        const { data: result, error } = await tryCatch(generateText({
            model: openrouter.chat(model.version),
            system: systemPrompt,
            prompt,
            tools,
            toolChoice: "required",
            maxOutputTokens: 2048,
            maxRetries: 3,
            abortSignal,
            stopWhen: [
                ({ steps }) =>
                {
                    // Stop as soon as any move tool succeeds
                    for (let i = steps.length - 1; i >= 0; i--)
                    {
                        for (const tr of steps[i].toolResults)
                        {
                            const isMoveTool = tr.toolName === "make_move"
                                || tr.toolName === "resign"
                                || tr.toolName === "offer_draw";

                            if (
                                isMoveTool &&
                                typeof tr.output === "object" &&
                                tr.output !== null &&
                                (tr.output as ToolMoveResult).success === true
                            ) return true;
                        }
                    }
                    return false;
                },
                stepCountIs(maxSteps * 3),
            ],
        }));

        if (error)
        {
            if (abortSignal?.aborted) throw error;
            console.log("[AI Debug] Agentic call error:", error);
            // Fall through to structured output fallback
        }

        if (result)
        {
            // Log all steps for debugging
            console.log(`[AI Debug] Total steps: ${result.steps.length}`);
            for (let i = 0; i < result.steps.length; i++)
            {
                const step = result.steps[i];
                console.log(`[AI Debug] Step ${i + 1}: text="${step.text?.substring(0, 200) || "(none)"}"`);
                for (const tc of step.toolCalls)
                {
                    console.log(`[AI Debug]   Tool call: ${tc.toolName}(${JSON.stringify("args" in tc ? tc.args : {})})`);
                }
                for (const tr of step.toolResults)
                {
                    console.log(`[AI Debug]   Tool result: ${tr.toolName} →`, JSON.stringify(tr.output));
                }
            }

            const { result: successResult, tries } = this.extractSuccessResult(result.steps);

            if (successResult)
            {
                console.log(`AI completed in ${tries} try/tries`);
                return {
                    move: successResult.move || "",
                    offerDraw: successResult.offerDraw || false,
                    resign: successResult.resign || false,
                    usage: result.totalUsage,
                    tries,
                };
            }

            console.warn("[AI Debug] Agentic path failed — no valid move. Falling back to structured output.");
        }

        // --- Fallback path: structured output (no tools) ---
        // Used when the model ignores toolChoice="required" or produces no valid move
        if (abortSignal?.aborted) throw new Error("Aborted");

        // Fallback also uses enum constraint for the move field
        const fallbackMoveEnum = legalMoves.length > 0
            ? z.enum(legalMoves as [string, ...string[]])
            : z.string().describe("Move in SAN notation");

        const fallbackSchema = z.object({
            move: fallbackMoveEnum.describe("Best move from the legal moves list in SAN notation"),
            offerDraw: z.boolean().describe("true to offer a draw, false otherwise"),
            resign: z.boolean().describe("true to resign, false otherwise"),
        });

        const fallbackPrompt = Prompts.buildFallbackPrompt(fen, turn, legalMoves);

        console.log("[AI Debug] Fallback: using structured output (generateObject)");

        const { data: fallbackResult, error: fallbackError } = await tryCatch(generateObject({
            model: openrouter.chat(model.version),
            system: systemPrompt,
            prompt: fallbackPrompt,
            schema: fallbackSchema,
            maxRetries: 3,
            abortSignal,
        }));

        if (fallbackError)
        {
            if (abortSignal?.aborted) throw fallbackError;
            console.error("[AI Debug] Fallback also failed:", fallbackError);
            throw new Error(fallbackError.message);
        }

        const { move, offerDraw, resign } = fallbackResult.object;
        console.log(`[AI Debug] Fallback response: move="${move}", offerDraw=${offerDraw}, resign=${resign}`);

        if (resign)
        {
            console.log("[AI Debug] Fallback → Resign");
            return { move: "", offerDraw: false, resign: true, usage: fallbackResult.usage, tries: 1 };
        }

        if (isLegalMoveFn(move))
        {
            console.log(`[AI Debug] Fallback → Move "${move}" is legal ✓`);
            return { move, offerDraw, resign: false, usage: fallbackResult.usage, tries: 1 };
        }

        // Last resort: if even the enum-constrained fallback fails,
        // pick a random legal move rather than throwing
        console.error(`[AI Debug] Fallback → Move "${move}" is ILLEGAL ✗. Picking random legal move.`);
        const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
        console.log(`[AI Debug] Random fallback → "${randomMove}"`);
        return {
            move: randomMove,
            offerDraw: false,
            resign: false,
            usage: fallbackResult.usage,
            tries: 1,
        };
    }
}

export default AISDK;
export { Models, getModel };