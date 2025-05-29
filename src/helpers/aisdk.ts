'use strict';
import { createProviderRegistry, generateText, type LanguageModelUsage, type CoreMessage } from "ai";
import { createOpenAI  } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { tryCatch } from "./tryCatch";

export namespace NAISDK
{
    export interface ApiKeys {
        openai: string;
        anthropic: string;
        google: string;
        xai: string;
        deepseek: string;
    }

    export enum Provider {
        OpenAI = "openai",
        Anthropic = "anthropic",
        Google = "google"
    }

    export interface Model {
        id: string;
        name: string;
        version: string;
        provider: NAISDK.Provider;
    }

    export interface Response {
        text: string;
        usage: LanguageModelUsage;
    }

    export type Role = "user" | "assistant" | "system";
}

const Models:  NAISDK.Model[] = [
    // OpenAI
    {
        id: "gpt-4.1",
        name: "GPT-4.1",
        version: "openai:gpt-4.1",
        provider: NAISDK.Provider.OpenAI
    },
    {
        id: "gpt-4.1-mini",
        name: "GPT-4.1 Mini",
        version: "openai:gpt-4.1-mini",
        provider: NAISDK.Provider.OpenAI
    },
    {
        id: "gpt-4.1-nano",
        name: "GPT-4.1 Nano",
        version: "openai:gpt-4.1-nano",
        provider: NAISDK.Provider.OpenAI
    },
    {
        id: "o4-mini",
        name: "o4-mini",
        version: "openai:o4-mini",
        provider: NAISDK.Provider.OpenAI
    },
    {
        id: "o3-mini",
        name: "o3-mini",
        version: "openai:o3-mini",
        provider: NAISDK.Provider.OpenAI
    },
    {
        id: "gpt-4o",
        name: "GPT-4o",
        version: "openai:gpt-4o",
        provider: NAISDK.Provider.OpenAI
    },
    {
        id: "gpt-4o-mini",
        name: "GPT-4o Mini",
        version: "openai:gpt-4o-mini",
        provider: NAISDK.Provider.OpenAI
    },

    // Anthropic
    {
        id: "claude-3-7-sonnet",
        name: "Claude 3.7 Sonnet",
        version: "anthropic:claude-3-7-sonnet-latest",
        provider: NAISDK.Provider.Anthropic
    },
    {
        id: "claude-3-5-sonnet",
        name: "Claude 3.5 Sonnet",
        version: "anthropic:claude-3-5-sonnet-latest",
        provider: NAISDK.Provider.Anthropic
    },
    {
        id: "claude-3-5-haiku",
        name: "Claude 3.5 Haiku",
        version: "anthropic:claude-3-5-haiku-latest",
        provider: NAISDK.Provider.Anthropic
    },

    // Google
    {
        id: "gemini-2.5-pro",
        name: "Gemini 2.5 Pro",
        version: "google:gemini-2.5-pro",
        provider: NAISDK.Provider.Google
    },
    {
        id: "gemini-2.5-flash",
        name: "Gemini 2.5 Flash",
        version: "google:gemini-2.5-flash",
        provider: NAISDK.Provider.Google
    },
    {
        id: "gemini-2.0-flash",
        name: "Gemini 2.0 Flash",
        version: "google:gemini-2.0-flash",
        provider: NAISDK.Provider.Google
    },
    {
        id: "gemini-1.5-pro",
        name: "Gemini 1.5 Pro",
        version: "google:gemini-1.5-pro",
        provider: NAISDK.Provider.Google
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

    private getRegistry = (model: NAISDK.Model) =>
    {
        let registryOptions = {};
        switch (model.provider)
        {
            case NAISDK.Provider.OpenAI:
            {
                registryOptions = {
                    openai: createOpenAI({
                        apiKey: this.apiKeys.openai
                    })
                };
            } break;

            case NAISDK.Provider.Anthropic:
            {
                registryOptions = {
                    anthropic: createAnthropic({
                        apiKey: this.apiKeys.anthropic,
                        headers: {
                            'anthropic-dangerous-direct-browser-access': 'true'
                        }
                    })
                };
            } break;

            case NAISDK.Provider.Google:
            {
                registryOptions = {
                    google: createGoogleGenerativeAI({
                        apiKey: this.apiKeys.google
                    })
                };
            } break;
        }

        const registry = createProviderRegistry(registryOptions);

        return registry;
    }


    generateText = async (model: NAISDK.Model, messages: CoreMessage[]): Promise<NAISDK.Response> =>
    {
        const registry = this.getRegistry(model);
        const { data: result, error } = await tryCatch(generateText({
            model: registry.languageModel(model.version as never),
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
}

export default AISDK;
export { Models, getModel };