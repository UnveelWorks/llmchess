import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from "react-router";
import './index.css';
import App from './App.tsx';
import Home from './pages/Home.tsx';

createRoot(document.getElementById('root')!).render(
	<BrowserRouter>
		<Routes>
			<Route path="/" element={<App />}>
				<Route path="/" element={<Home />} />
			</Route>
		</Routes>
	</BrowserRouter>
);
