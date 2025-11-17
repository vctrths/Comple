import { useState } from "react";
import type { ApiResponse } from "shared";
import "./App.css";

const API_BASE_URL = import.meta.env.DEV ? "http://localhost:3000" : "/api";

function App() {
	const [data, setData] = useState<ApiResponse | undefined>();

	async function sendRequest() {
		try {
			const req = await fetch(`${API_BASE_URL}/hello`);
			const res: ApiResponse = await req.json();
			setData(res);
		} catch (error) {
			console.log(error);
		}
	}

	return (
		<main>
			<img src="/logo.png" alt="Orbiter logo" />
			<p>
				Get started by editing <span className="code">src/App.tsx</span>
			</p>
			<div className="link-container">
				<a
					href="https://docs.orbiter.host"
					target="_blank"
					rel="noopener noreferrer"
					className="link"
				>
					Docs
				</a>
				<a
					href="https://github.com/orbiterhost"
					target="_blank"
					rel="noopener noreferrer"
					className="link secondary"
				>
					Github
				</a>
			</div>
			<div className="link-container">
				<button onClick={sendRequest} className="link" type="button">
					Call API
				</button>
				<a
					href="https://bhvr.dev"
					target="_blank"
					rel="noopener noreferrer"
					className="link secondary"
				>
					bhvr Docs
				</a>
			</div>

			{data && (
				<code className="code-response">
					Message: {data.message} <br />
					Success: {data.success.toString()}
				</code>
			)}
		</main>
	);
}

export default App;
