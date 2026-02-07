import { useCallback, useEffect, useState } from "react";
import type { ModelMessage } from "ai";
import type { NAISDK } from "../../helpers/aisdk";
import Container from "../container/Container";
import IconButton from "../button/Button";
import Modal, { ModalContent, ModalFooter, ModalHeader } from "../modal/Modal";
import { CogSvg, GithubSvg, RotateCounterClockwiseSvg, SpeakerSvg, SpeakerOffSvg } from "../svgs/Svgs";
import Input from "../input/Input";
import Button from "../button/Button";
import { getModel } from "../../helpers/aisdk";
import AISDK from "../../helpers/aisdk";
import { tryCatch } from "../../helpers/tryCatch";
import toast from "react-hot-toast";
import Storage from "../../storage/storage";
import { useSettingsStore } from "../../store/store";
import ScrollView from "../scroll_view/ScrollView";
import Textarea from "../textarea/Textarea";
import Prompts from "../../data/prompts";

function Header()
{
    const {
        apiKeys,
        retries,
        prompts,
        soundEnabled,
        setApiKeys,
        setRetries,
        setPrompts,
        setSoundEnabled
    } = useSettingsStore();
    const [settingsModalOpen, setSettingsModalOpen] = useState(false);
    const [openRouterApiKey, setOpenRouterApiKey] = useState("");
    const [numberOfRetries, setNumberOfRetries] = useState(10);
    const [moveGenerationPrompt, setMoveGenerationPrompt] = useState("");
    const [moveCorrectionPrompt, setMoveCorrectionPrompt] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSettingsModalOpen = useCallback(() => 
    {
        setSettingsModalOpen(true);
    }, []);

    const handleSettingsModalClose = useCallback(() => 
    {
        setSettingsModalOpen(false);
    }, []);

    const handleOpenRouterApiKeyChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => 
    {
        const target = e.target as HTMLInputElement;
        setOpenRouterApiKey(target.value);
    }, []);

    const handleNumberOfRetriesChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => 
    {
        const target = e.target as HTMLInputElement;
        setNumberOfRetries(parseInt(target.value) || 10);
    }, []);

    const handleMoveGenerationPromptChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => 
    {
        const target = e.target as HTMLTextAreaElement;
        setMoveGenerationPrompt(target.value);
    }, []);

    const handleMoveCorrectionPromptChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => 
    {
        const target = e.target as HTMLTextAreaElement;
        setMoveCorrectionPrompt(target.value);
    }, []);

    const handleResetPrompts = useCallback(() =>
    {
        setMoveGenerationPrompt(Prompts.defaultAgenticPrompt.trim());
        setMoveCorrectionPrompt(Prompts.defaultMoveCorrectionPrompt.trim());
    }, []);

    const toggleSound = useCallback(() => {
        const newValue = !soundEnabled;
        setSoundEnabled(newValue);
        Storage.store(Storage.Schema.sound_enabled, newValue);
    }, [soundEnabled, setSoundEnabled]);

    const verify = useCallback(async () => 
    {
        if (
            isLoading || 
            !openRouterApiKey ||
            !numberOfRetries ||
            !moveGenerationPrompt ||
            !moveCorrectionPrompt
        ) return;
        
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
        
        const { error: apiKeysError } = await tryCatch(Storage.store(Storage.Schema.api_keys, apiKeys));
        if (apiKeysError)
        {
            toast.error(apiKeysError.message);
            return;
        }

        const { error: retriesError } = await tryCatch(Storage.store(Storage.Schema.retries, numberOfRetries));
        if (retriesError)
        {
            toast.error(retriesError.message);
            return;
        }

        const newPrompts = {
            moveGeneration: moveGenerationPrompt,
            moveCorrection: moveCorrectionPrompt
        };

        const { error: promptsError } = await tryCatch(Storage.store(Storage.Schema.prompts, newPrompts));
        if (promptsError)
        {
            toast.error(promptsError.message);
            return;
        }

        setApiKeys(apiKeys);
        setRetries(numberOfRetries);
        setPrompts(newPrompts);
        toast.success("Settings saved");
        handleSettingsModalClose();
    }, [openRouterApiKey, numberOfRetries, moveGenerationPrompt, moveCorrectionPrompt, isLoading]);

    useEffect(() =>
    {
        if (!settingsModalOpen) return;

        setOpenRouterApiKey(apiKeys.openrouter);
        setNumberOfRetries(retries);
        setMoveGenerationPrompt(prompts.moveGeneration);
        setMoveCorrectionPrompt(prompts.moveCorrection);
    }, [settingsModalOpen]);
 
    return (
        <header className="h-14 shrink-0 border-b border-white/[0.06]">
            <Container className="h-full flex-row items-center">
                <nav className="flex flex-1 items-center gap-2">
                    <div className="flex-1 flex items-center gap-3">
                        <img src="/images/logo.png" alt="LLMChess" className="w-7" />
                        <h1 className="text-xl font-normal"><b className="text-white">LLM</b><span className="text-neutral-400">Chess</span></h1>
                    </div>
                    <ul className="flex flex-1 items-center justify-end gap-2">
                        <li>
                            <IconButton type="medium" onlyIcon onClick={toggleSound}>
                                {soundEnabled ? <SpeakerSvg className="w-5 h-5" /> : <SpeakerOffSvg className="w-5 h-5" />}
                            </IconButton>
                        </li>
                        <li>
                            <IconButton type="medium" onClick={handleSettingsModalOpen}>
                                <CogSvg className="w-5 h-5" />
                                Settings
                            </IconButton>
                        </li>
                        <li>
                            <a 
                                href="https://github.com/UnveelWorks/llmchess" 
                                target="_blank" 
                                rel="noopener noreferrer"
                            >
                                <IconButton type="medium" onlyIcon>
                                    <GithubSvg className="w-5 h-5" />
                                </IconButton>
                            </a>
                        </li>
                    </ul>
                </nav>
                <Modal open={settingsModalOpen}>
                    <ModalHeader title="Settings" onClose={handleSettingsModalClose}/>
                    <ModalContent className="h-96 flex p-0">
                        <ScrollView className="p-4">
                            <div className="flex flex-col gap-4">
                                <Input 
                                    className="mt-0"
                                    label="OpenRouter API Key"
                                    type="text" 
                                    placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                    value={openRouterApiKey}
                                    onChange={handleOpenRouterApiKeyChange}
                                />

                                <Input
                                    className="mt-0"
                                    label="Max AI Steps"
                                    type="text"
                                    placeholder="10"
                                    value={numberOfRetries.toString()}
                                    onChange={handleNumberOfRetriesChange}
                                />

                                <div className="mt-4 flex items-center gap-2">
                                    <span className="flex-1 text-sm font-medium text-neutral-400">
                                        Prompts
                                    </span>
                                    <Button
                                        onClick={handleResetPrompts}
                                    >
                                        <RotateCounterClockwiseSvg className="w-4 h-4"/>
                                        Reset
                                    </Button>
                                </div>

                                <Textarea 
                                    className="mt-0 h-48"
                                    label="Move Generation Prompt"
                                    placeholder="Generate a move for the given position"
                                    value={moveGenerationPrompt}
                                    onChange={handleMoveGenerationPromptChange}
                                />

                                <Textarea 
                                    className="mt-0 h-48"
                                    label="Move Correction Prompt"
                                    placeholder="Correct the move for the given position"
                                    value={moveCorrectionPrompt}
                                    onChange={handleMoveCorrectionPromptChange}
                                />
                            </div>
                        </ScrollView>
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