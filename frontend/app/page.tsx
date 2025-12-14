type User = {
	id: number;
	name: string;
};

// コンポーネント自体を async にする
export default async function Home() {
	// Docker内部通信に backend:8000
	const res = await fetch("http://backend:8000/users", { cache: "no-store" });

	if (!res.ok) {
		return (
			<p className="text-4xl font-bold text-red-500 mb-4 p-8">
				Error loading users
			</p>
		);
	}

	const users: User[] = await res.json();

	return (
		<main className="p-8">
			<h1 className="text-4xl font-bold mb-4">Users</h1>
			<ul className="list-disc pl-5">
				{users.map((user) => (
					<li key={user.id}>{user.name}</li>
				))}
			</ul>
		</main>
	);
}
