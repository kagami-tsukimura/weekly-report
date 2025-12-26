"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

function getApiUrl(): string {
	const url = process.env.API_URL;
	if (!url) {
		throw new Error("API_URL environment variable is required");
	}
	return url;
}
const UNKNOWN_ERROR_MESSAGE: string = "Unknown error occured";

export type FormState = {
	message: string;
	error?: boolean;
};

export async function createReport(
	_prevState: FormState,
	formData: FormData,
): Promise<FormState> {
	// Get session
	const session = await auth();
	if (!session?.user?.authId) {
		return { message: "Not authenticated", error: true };
	}

	const week_start = formData.get("week_start");
	const done = formData.get("done");
	const todo = formData.get("todo");
	const issues = formData.get("issues");
	const learning_hours = formData.get("learning_hours");

	try {
		// post to backend
		const res = await fetch(`${getApiUrl()}/reports`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Auth-ID": session.user.authId,
				"X-User-Name": encodeURIComponent(session.user.name ?? ""),
			},
			body: JSON.stringify({
				week_start,
				done,
				todo,
				issues,
				learning_hours: Number(learning_hours),
			}),
		});

		if (!res.ok) {
			return { message: "Failed to create report", error: true };
		}

		// cache update
		revalidatePath("/");
		return { message: "Report created successfully!", error: false };
	} catch (e) {
		if (e instanceof Error) {
			return { message: e.message, error: true };
		}
		return { message: UNKNOWN_ERROR_MESSAGE, error: true };
	}
}

export async function updateReport(
	id: number,
	_prevState: FormState,
	formData: FormData,
): Promise<FormState> {
	// Get session
	const session = await auth();
	if (!session?.user?.authId) {
		return { message: "Not authenticated", error: true };
	}

	const week_start = formData.get("week_start");
	const done = formData.get("done");
	const todo = formData.get("todo");
	const issues = formData.get("issues");
	const learning_hours = formData.get("learning_hours");

	try {
		// put to backend
		const res = await fetch(`${getApiUrl()}/reports/${id}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				"X-Auth-ID": session.user.authId,
				"X-User-Name": encodeURIComponent(session.user.name ?? ""),
			},
			body: JSON.stringify({
				week_start,
				done,
				todo,
				issues,
				learning_hours: Number(learning_hours),
			}),
		});

		if (!res.ok) {
			return { message: "Failed to update report", error: true };
		}

		// cache update
		revalidatePath("/");
		return { message: "Report updated successfully!", error: false };
	} catch (e) {
		if (e instanceof Error) {
			return { message: e.message, error: true };
		}
		return { message: UNKNOWN_ERROR_MESSAGE, error: true };
	}
}

export async function deleteReport(id: number): Promise<FormState> {
	const session = await auth();
	if (!session?.user?.authId) {
		return { message: "Not authenticated", error: true };
	}
	try {
		const res = await fetch(`${getApiUrl()}/reports/${id}`, {
			method: "DELETE",
			headers: {
				"X-Auth-ID": session.user.authId,
			},
		});
		if (!res.ok) {
			return { message: "Failed to delete report" };
		}

		// cache update
		revalidatePath("/");
		return { message: "Report deleted successfully!" };
	} catch (e) {
		if (e instanceof Error) {
			return { message: e.message };
		}
		return { message: UNKNOWN_ERROR_MESSAGE };
	}
}
