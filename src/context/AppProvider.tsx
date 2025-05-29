import { createContext, useContext, useEffect, useState } from "react";
import Storage from "../storage/storage";
import type { NAISDK } from "../helpers/aisdk";

export interface AppContextType {
    apiKeys: NAISDK.ApiKeys;
    apiKeysModalOpen: boolean;
    setApiKeys: React.Dispatch<React.SetStateAction<NAISDK.ApiKeys>>;
    setApiKeysModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => 
{
    const context = useContext(AppContext);
    if (!context) 
    {
        throw new Error('useApp must be used within a AppProvider');
    }
    return context;
};

export const AppProvider = ({ children }: { children: React.ReactNode }) => 
{
    const [apiKeys, setApiKeys] = useState<NAISDK.ApiKeys>({
        openai: "",
        anthropic: "",
        google: "",
        xai: "",
        deepseek: ""
    });
    const [apiKeysModalOpen, setApiKeysModalOpen] = useState(false);

    const value = {
        apiKeys,
        apiKeysModalOpen,
        setApiKeys,
        setApiKeysModalOpen,
    };

    useEffect(() => 
    {
        (async () => 
        {
            try
            {
                await Storage.init();
                const keys = await Storage.get(Storage.Schema.api_keys);
                setApiKeys(keys);
            }
            catch (err)
            {
                console.log(err);
            }
        })();
    }, []);

    return (
        <AppContext.Provider value={value}>
            { children }
        </AppContext.Provider>
    );
};