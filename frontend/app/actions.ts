"use server";

import { revalidatePath } from "next/cache";

const API_BASE_URL = "http://backend:8000";
const UNKNOWN_ERROR_MESSAGE: string = "Unknown error occured";

export type FormState = {
	message: string;
	error?: boolean;
};

export async function createReport(
	_prevState: FormState,
	formData: FormData,
): Promise<FormState> {
	// fetch formData
	const user_id = 1;
	const week_start = formData.get("week_start");
	const done = formData.get("done");
	const todo = formData.get("todo");
	const issues = formData.get("issues");
	const learning_hours = formData.get("learning_hours");

	try {
		// post to backend
		const res = await fetch(`${API_BASE_URL}/reports`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				user_id,
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
		} else {
			return { message: UNKNOWN_ERROR_MESSAGE, error: true };
		}
	}
}
