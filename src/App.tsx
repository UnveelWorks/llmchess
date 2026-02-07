import { Outlet } from 'react-router';
import Header from './components/header/Header';
import { Toaster } from 'react-hot-toast';
import { useSettingsStore } from './store/store';
import { useEffect } from 'react';
import Storage from './storage/storage';
import { tryCatch } from './helpers/tryCatch';

function App() 
{
	const { setApiKeys, setRetries, setPrompts, setSoundEnabled } = useSettingsStore();
	useEffect(() =>
	{
		(async () =>
		{
			await Storage.init();

			const { data: apiKeys } = await tryCatch(Storage.get(Storage.Schema.api_keys));
			setApiKeys(apiKeys || { openrouter: "" });

			const { data: retries } = await tryCatch(Storage.get(Storage.Schema.retries));
			setRetries(retries || 10);

			const { data: prompts } = await tryCatch(Storage.get(Storage.Schema.prompts));
			setPrompts(prompts || { moveGeneration: "", moveCorrection: "" });

			const { data: soundEnabled } = await tryCatch(Storage.get(Storage.Schema.sound_enabled));
			setSoundEnabled(soundEnabled ?? true);
		})();
	}, []);

	return (
		<>
			<div className="h-screen flex flex-col">
				<Header />
				<Outlet />
			</div>
			<Toaster position="top-center"/>
		</>
	)
}

export default App
