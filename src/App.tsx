import { Outlet } from 'react-router';
import Header from './components/header/Header';
import { Toaster } from 'react-hot-toast';
import { useApiKeysStore } from './store/store';
import { useEffect } from 'react';
import Storage from './storage/storage';
import { tryCatch } from './helpers/tryCatch';

function App() 
{
	const { setApiKeys } = useApiKeysStore();
	useEffect(() => 
	{
		(async () =>
		{
			const { data: apiKeys, error } = await tryCatch(Storage.get(Storage.Schema.api_keys));
			if (error) return;
			setApiKeys(apiKeys);
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
