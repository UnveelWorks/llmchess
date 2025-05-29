import { Outlet } from 'react-router';
import Header from './components/header/Header';
import { AppProvider } from './context/AppProvider';
import { Toaster } from 'react-hot-toast';

function App() 
{
	return (
		<AppProvider>
			<div className="h-screen flex flex-col">
				<Header />
				<Outlet />
			</div>
			<Toaster position="top-center"/>
		</AppProvider>
	)
}

export default App
