"use client";

import { useEffect, useState } from "react";

type User = {
	id: number;
	name: string;
};

export default function Home() {
	const [users, setUsers] = useState<User[]>([]);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetch("http://localhost:8000/users")
			.then((res) => {
				if (!res.ok) throw new Error("Network response was not ok");
				return res.json();
			})
			.then((data) => setUsers(data))
			.catch((err) => {
				console.error(err);
				setError("Failed to get data");
			});
	}, []);
	return (
		<main className="p-8">
			<h1 className="text-4xl font-red-500 mb-4">Users</h1>

			{error && <p className="text-red-500 mb-4">{error}</p>}

			{users.length === 0 && !error ? (
				<p>Loading...</p>
			) : (
				<ul className="list-disc pl-5">
					{users.map((user) => (
						<li key={user.id}>{user.name}</li>
					))}
				</ul>
			)}
		</main>
	);
}
