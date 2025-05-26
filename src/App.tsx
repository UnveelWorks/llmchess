import { Outlet } from 'react-router';
import Header from './components/header/Header';

function App() {
	return (
		<div className="flex flex-col min-h-screen">
			<Header />
			<Outlet />
		</div>
	)
}

export default App
