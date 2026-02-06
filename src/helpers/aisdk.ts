'use strict';
import { generateText, type LanguageModelUsage, type ModelMessage, generateObject } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { tryCatch } from "./tryCatch";
import type { z } from "zod";

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

    export interface ObjectResponse {
        object: any;
        usage: LanguageModelUsage;
    }

    export type Role = "user" | "assistant" | "system";
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

    generateObject = async (
        model: NAISDK.Model,
        prompt: string,
        schema: z.ZodObject<z.ZodRawShape>
    ): Promise<NAISDK.ObjectResponse> =>
    {
        const openrouter = createOpenRouter({
            apiKey: this.apiKeys.openrouter,
        });

        const { data: result, error } = await tryCatch(generateObject({
            model: openrouter.chat(model.version),
            output: "object",
            prompt,
            schema,
        }));

        if (error)
        {
            console.log(error);
            throw new Error(error.message);   
        }

        const { object, usage } = result;
        return {
            object, 
            usage
        };
    }
}

export default AISDK;
export { Models, getModel };