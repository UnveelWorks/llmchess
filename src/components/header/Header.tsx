import { useCallback, useEffect, useState } from "react";
import type { ModelMessage } from "ai";
import type { NAISDK } from "../../helpers/aisdk";
import Container from "../container/Container";
import IconButton from "../button/Button";
import Modal, { ModalContent, ModalFooter, ModalHeader } from "../modal/Modal";
import { GithubSvg, KeySvg } from "../svgs/Svgs";
import Input from "../input/Input";
import Button from "../button/Button";
import { getModel } from "../../helpers/aisdk";
import AISDK from "../../helpers/aisdk";
import { tryCatch } from "../../helpers/tryCatch";
import toast from "react-hot-toast";
import Storage from "../../storage/storage";
import { OpenRouterSvg } from "../svgs/Svgs";
import { useApiKeysStore } from "../../store/store";

function Header()
{
    const { apiKeys, setApiKeys } = useApiKeysStore();
    const [apiKeysModalOpen, setApiKeysModalOpen] = useState(false);
    const [openRouterApiKey, setOpenRouterApiKey] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleApiKeysModalOpen = useCallback(() => 
    {
        setApiKeysModalOpen(true);
    }, []);

    const handleApiKeysModalClose = useCallback(() => 
    {
        setApiKeysModalOpen(false);
    }, []);

    const handleOpenRouterApiKeyChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => 
    {
        const target = e.target as HTMLInputElement;
        setOpenRouterApiKey(target.value);
    }, []);

    const verify = useCallback(async () => 
    {
        if (isLoading || !openRouterApiKey) return;
        
        setIsLoading(true);

        const messages: ModelMessage[] = [
            {
                role: "user",
                content: "trying out the api, respond with only yes or no"
            }
        ];

        const apiKeys: NAISDK.ApiKeys = {
            openrouter: openRouterApiKey
        };

        const aisdk = new AISDK(apiKeys);
        if (openRouterApiKey)
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
    }, [openRouterApiKey]);

    useEffect(() =>
    {
        if (!apiKeysModalOpen) return;
        setOpenRouterApiKey(apiKeys.openrouter);
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
                                <OpenRouterSvg className="w-8 h-8 text-[#71717A]"/>
                            </div>
                            <Input 
                                className="mt-0 flex-1"
                                label="OpenRouter API Key"
                                type="text" 
                                placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                value={openRouterApiKey}
                                onChange={handleOpenRouterApiKeyChange}
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