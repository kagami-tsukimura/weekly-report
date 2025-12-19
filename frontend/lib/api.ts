import type { Report } from "@/types";

// Docker内部通信に backend:8000
const API_BASE_URL = "http://backend:8000";

export async function getReports(): Promise<Report[]> {
	const res = await fetch(`${API_BASE_URL}/reports`, {
		cache: "no-store",
	});
	if (!res.ok) {
		throw new Error("Failed to fetch reports");
	}

	return res.json();
}
