import { auth } from "@/auth";
import type { Report } from "@/types";

// Docker内部通信に backend:8000
const API_BASE_URL = "http://backend:8000";

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
			"X-User-Name": session.user.name ?? "",
		},
	});

	if (!res.ok) {
		throw new Error("Failed to fetch reports");
	}

	return res.json();
}
