'use strict';
import { generateText, type LanguageModelUsage, type ModelMessage, generateObject } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { tryCatch } from "./tryCatch";
import type { ZodSchema } from "zod";

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
        id: "gpt-5-mini",
        name: "OpenAI GPT-5 Mini",
        version: "openai/gpt-5-mini",
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
        id: "gpt-4.1-nano",
        name: "OpenAI GPT-4.1 Nano",
        version: "openai/gpt-4.1-nano",
    },
    {
        id: "o4-mini",
        name: "OpenAI o4-mini",
        version: "openai/o4-mini",
    },
    {
        id: "o3-mini",
        name: "OpenAI o3-mini",
        version: "openai/o3-mini",
    },
    {
        id: "gpt-4o",
        name: "OpenAI GPT-4o",
        version: "openai/gpt-4o",
    },  
    {
        id: "gpt-4o-mini",
        name: "OpenAI GPT-4o Mini",
        version: "openai/gpt-4o-mini",
    },

    // Anthropic
    {
        id: "claude-3-7-sonnet",
        name: "Anthropic Claude 3.7 Sonnet",
        version: "anthropic/claude-3-7-sonnet",
    },
    {
        id: "claude-3-5-sonnet",
        name: "Anthropic Claude 3.5 Sonnet",
        version: "anthropic/claude-3-5-sonnet",
    },
    {
        id: "claude-3-5-haiku",
        name: "Anthropic Claude 3.5 Haiku",
        version: "anthropic/claude-3-5-haiku",
    },

    // Google
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
        id: "gemini-2.0-flash",
        name: "Google Gemini 2.0 Flash",
        version: "google/gemini-2.0-flash",
    },
    {
        id: "gemini-1.5-pro",
        name: "Google Gemini 1.5 Pro",
        version: "google/gemini-1.5-pro",
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
        schema: ZodSchema
    ): Promise<NAISDK.ObjectResponse> =>
    {
        const openrouter = createOpenRouter({
            apiKey: this.apiKeys.openrouter,
        });

        const { data: result, error } = await tryCatch(generateObject({
            model: openrouter.chat(model.version),
            output: "object",
            mode: "json",
            system: "You must respond with valid JSON only. Do not include any explanatory text, code blocks, or markdown formatting.",
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