'use strict';
import type { NAISDK } from "../helpers/aisdk";
import Prompts from "../data/prompts";
import { tryCatch } from "../helpers/tryCatch";

export namespace NStorage 
{
    export interface SchemaItem<T> {
        key: string;
        value: T;
    }

    export interface Schema {
        [key: string]: SchemaItem<any>;
    }
};

const Schema = {
    api_keys: {
        key: "api_keys",
        value: {
            openrouter: ""
        }
    } as NStorage.SchemaItem<NAISDK.ApiKeys>,
    retries: {
        key: "retries",
        value: 10
    } as NStorage.SchemaItem<number>,
    prompts: {
        key: "prompts",
        value: {
            moveGeneration: Prompts.defaultMovePrompt,
            moveCorrection: Prompts.defaultMoveCorrectionPrompt
        }
    } as NStorage.SchemaItem<{
        moveGeneration: string;
        moveCorrection: string;
    }>,
};

async function repair()
{}

async function init()
{
    try
    {
        await repair();
        await checkAndStore(Schema.api_keys);
        await checkAndStore(Schema.retries);
        await checkAndStore(Schema.prompts);
    }
    catch (err)
    {
        console.log(err);
    }
}

async function reset()
{
    try
    {
        await store(Schema.api_keys, Schema.api_keys.value);
        await store(Schema.retries, Schema.retries.value);
        await store(Schema.prompts, Schema.prompts.value);
    }
    catch (err)
    {
        console.log(err);
    }
}

async function checkAndStore(path: NStorage.SchemaItem<any>)
{
    try
    {
        await get(path);
    }
    catch (err)
    {
        console.log("[CREATING STORAGE]", path.key);
        await store(path, path.value);
    }
}

async function store<T>(path: NStorage.SchemaItem<T>, data: T)
{
    const arr = path.key.split(".");
    try
    {
        const rawStorage = await localStorage.getItem(arr[0]);
        let store = rawStorage ? JSON.parse(rawStorage) : {};
        
        if (arr.length > 1)
        {
            let result = store;
            for (let i = 1; i <= arr.length - 1; i++)
            {
                if (i === arr.length - 1)
                {
                    result[arr[i]] = data;
                    break;
                }
                
                if (!result[arr[i]])
                {
                    result[arr[i]] = {};
                }
                result = result[arr[i]];
            }

            await localStorage.setItem(arr[0], JSON.stringify(store));
        }
        else
        {
            await localStorage.setItem(arr[0], JSON.stringify(data));
        }
    }
    catch (err)
    {
        throw err;
    }
}

async function get<T>(path: NStorage.SchemaItem<T>): Promise<T>
{
    const arr = path.key.split(".");
        
    try
    {
        const rawStorage = await localStorage.getItem(arr[0]);
        let store = rawStorage ? JSON.parse(rawStorage) : null;
        if (!store) 
        {
            throw new Error(`"${arr[0]}" does not exist.`);
        }

        let result = store;
        for (let i = 1; i < arr.length; i++)
        {
            result = result[arr[i]];
            if (result === undefined || result === null) 
            {
                throw new Error(`"${arr[i]}" does not exist.`);
            }
        }

        return result as T;
    }
    catch (err)
    {
        throw err;
    }
}

async function remove(path: NStorage.SchemaItem<any>)
{
    const arr = path.key.split(".");
    try
    {
        const rawStorage = await localStorage.getItem(arr[0]);
        let store = rawStorage ? JSON.parse(rawStorage) : {};
        if (!store) throw new Error(`"${arr[0]}" does not exist.`);

        if (arr.length > 1)
        {
            let result = store;
            for (let i = 1; i < arr.length - 1; i++)
            {
                result = result[arr[i]];
                if (!result) throw new Error(`"${arr[i]}" does not exist.`);
            }
    
            delete result[arr[arr.length - 1]];
            await localStorage.setItem(arr[0], JSON.stringify(store));
        }
        else
        {
            await localStorage.removeItem(arr[0]);
        }
    }
    catch (err)
    {
        throw err;
    }
}

const Storage = {
    Schema,

    init,
    store,
    get,
    remove,
    reset
}

export default Storage;


