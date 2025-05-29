import { useCallback, useEffect, useState } from "react";
import { useApp } from "../../context/AppProvider";
import Container from "../container/Container";
import IconButton from "../button/Button";
import Modal, { ModalContent, ModalFooter, ModalHeader } from "../modal/Modal";
import { ClaudeSvg, GeminiSvg, GithubSvg, KeySvg, OpenAiSvg } from "../svgs/Svgs";
import Input from "../input/Input";
import Button from "../button/Button";
import { getModel, NAISDK } from "../../helpers/aisdk";
import type { CoreMessage } from "ai";
import AISDK from "../../helpers/aisdk";
import { tryCatch } from "../../helpers/tryCatch";
import toast from "react-hot-toast";
import Storage from "../../storage/storage";

function Header()
{
    const { apiKeysModalOpen, setApiKeysModalOpen, apiKeys, setApiKeys } = useApp();
    const [openAiApiKey, setOpenAiApiKey] = useState(apiKeys.openai);
    const [anthropicApiKey, setAnthropicApiKey] = useState(apiKeys.anthropic);
    const [googleApiKey, setGoogleApiKey] = useState(apiKeys.google);
    const [isLoading, setIsLoading] = useState(false);

    const handleApiKeysModalOpen = useCallback(() => 
    {
        setApiKeysModalOpen(true);
    }, []);

    const handleApiKeysModalClose = useCallback(() => 
    {
        setApiKeysModalOpen(false);
    }, []);

    const handleOpenAiApiKeyChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => 
    {
        const target = e.target as HTMLInputElement;
        setOpenAiApiKey(target.value);
    }, []);

    const handleAnthropicApiKeyChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => 
    {
        const target = e.target as HTMLInputElement;
        setAnthropicApiKey(target.value);
    }, []);

    const handleGoogleApiKeyChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => 
    {
        const target = e.target as HTMLInputElement;
        setGoogleApiKey(target.value);
    }, []);

    const verify = useCallback(async () => 
    {
        if (
            isLoading ||
            (
                !openAiApiKey && 
                !anthropicApiKey && 
                !googleApiKey
            )
        ) return;
        
        setIsLoading(true);

        const messages: CoreMessage[] = [
            {
                role: "user",
                content: "trying out the api, respond with only yes or no"
            }
        ];

        const apiKeys: NAISDK.ApiKeys = {
            openai: openAiApiKey,
            anthropic: anthropicApiKey,
            google: googleApiKey,
            xai: "",
            deepseek: ""
        };

        const aisdk = new AISDK(apiKeys);
        if (openAiApiKey)
        {
            const model = getModel("gpt-4o-mini");
            const { error } = await tryCatch(aisdk.generateText(
                model,
                messages
            ));

            if (error)
            {
                toast.error(error.message);
                return;
            }
        }

        if (anthropicApiKey)
        {
            const model = getModel("claude-3-5-haiku");
            const { error } = await tryCatch(aisdk.generateText(
                model,
                messages
            ));

            if (error)
            {
                toast.error(error.message);
                return;  
            }
        }

        if (googleApiKey)
        {
            const model = getModel("gemini-2.5-flash");
            const { error } = await tryCatch(aisdk.generateText(
                model,
                messages
            ));

            if (error)
            {
                toast.error(error.message);
                return;
            }
        }

        setIsLoading(false);
        
        const { error } = await tryCatch(Storage.store(Storage.Schema.api_keys, apiKeys));
        if (error)
        {
            toast.error(error.message);
            return;
        }

        setApiKeys(apiKeys);
        toast.success("API keys saved");
        handleApiKeysModalClose();
    }, [openAiApiKey, anthropicApiKey, googleApiKey]);

    useEffect(() =>
    {
        setOpenAiApiKey(apiKeys.openai);
        setAnthropicApiKey(apiKeys.anthropic);
        setGoogleApiKey(apiKeys.google);
    }, [apiKeysModalOpen]);
 
    return (
        <header className="h-16 shrink-0">
            <Container className="h-full flex-row items-center">
                <nav className="flex flex-1 items-center gap-2">
                    <div className="flex-1 flex items-center">
                        <h1 className="text-2xl font-bold">LLMChess</h1>
                    </div>
                    <ul className="flex flex-1 items-center justify-end gap-2">
                        <li>
                            <IconButton type="medium" onClick={handleApiKeysModalOpen}>
                                <KeySvg className="w-5 h-5" />
                                API Keys
                            </IconButton>
                        </li>
                        <li>
                            <a href="">
                                <IconButton type="medium" onlyIcon>
                                    <GithubSvg className="w-5 h-5" />
                                </IconButton>
                            </a>
                        </li>
                    </ul>
                </nav>
                <Modal open={apiKeysModalOpen}>
                    <ModalHeader title="API Keys" onClose={handleApiKeysModalClose}/>
                    <ModalContent className="p-6 flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-14 h-14 flex items-center justify-center bg-white rounded-md">
                                <OpenAiSvg className="w-8 h-8"/>
                            </div>
                            <Input 
                                className="mt-0 flex-1"
                                label="OpenAI API Key"
                                type="text" 
                                placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                value={openAiApiKey}
                                onChange={handleOpenAiApiKeyChange}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-14 h-14 flex items-center justify-center bg-white rounded-md">
                                <ClaudeSvg className="w-8 h-8"/>
                            </div>
                            <Input 
                                className="mt-0 flex-1"
                                label="Anthropic API Key"
                                type="text" 
                                placeholder="sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" 
                                value={anthropicApiKey}
                                onChange={handleAnthropicApiKeyChange}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-14 h-14 flex items-center justify-center bg-white rounded-md">
                                <GeminiSvg className="w-9 h-9"/>
                            </div>
                            <Input 
                                className="mt-0 flex-1"
                                label="Google Gemini API Key"
                                type="text" 
                                placeholder="AIxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" 
                                value={googleApiKey}
                                onChange={handleGoogleApiKeyChange}
                            />
                        </div>                        
                    </ModalContent>
                    <ModalFooter>
                        <Button theme="white" type="medium" isLoading={isLoading} onClick={verify}>
                            Save
                        </Button>
                    </ModalFooter>
                </Modal>
            </Container>
        </header>
    )
}

export default Header;