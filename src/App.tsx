import { Outlet } from 'react-router';
import Header from './components/header/Header';

function App() {
	return (
		<div className="h-screen flex flex-col">
			<Header />
			<Outlet />
		</div>
	)
}

export default App
