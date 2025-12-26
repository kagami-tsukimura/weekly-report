import { auth } from "@/auth";
import type { Report } from "@/types";

if (!process.env.API_URL) {
	throw new Error("API_URL environment variable is required");
}
const API_BASE_URL = process.env.API_URL;

export async function getReports(): Promise<Report[]> {
	// Get session
	const session = await auth();
	if (!session?.user?.authId) {
		throw new Error("Not authenticated");
	}

	const res = await fetch(`${API_BASE_URL}/reports`, {
		cache: "no-store",
		headers: {
			"X-Auth-ID": session.user.authId,
			"X-User-Name": encodeURIComponent(session.user.name ?? ""),
		},
	});

	if (!res.ok) {
		throw new Error("Failed to fetch reports");
	}

	return res.json();
}
