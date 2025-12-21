"use client";
import { useActionState, useRef } from "react";

import { createReport, type FormState } from "@/app/actions";

const ENTER = "Enter";
const initialState: FormState = {
	message: "",
};

export default function ReportForm() {
	const [state, formAction, isPending] = useActionState(
		createReport,
		initialState,
	);

	const formRef = useRef<HTMLFormElement>(null);

	const handleKeyDown = (e: React.KeyboardEvent) => {
		// Ctrl or Command + Enter
		if ((e.ctrlKey || e.metaKey) && e.key === ENTER) {
			e.preventDefault();
			// Submit Report
			formRef.current?.requestSubmit();
		}
	};

	return (
		<form
			ref={formRef}
			action={formAction}
			onKeyDown={handleKeyDown}
			className="bg-gray-900 border border-gray-800 p-6 rounded-xl space-y-4"
		>
			<h2 className="text-xl font-bold mb-4 text-gray-100">
				Create New Report
			</h2>

			{/* Result Area */}
			{state.message && (
				<div
					className={`p-3 rounded ${state.error ? "bg-red-900/50 text-red-200" : "bg-green-900/50 text-green-200"}`}
				>
					{state.message}
				</div>
			)}

			{/* Input */}
			<div>
				<label
					htmlFor="week_start"
					className="block text-sm font-medium text-gray-400 mb-1"
				>
					Week Start
				</label>
				<input
					name="week_start"
					type="date"
					required
					className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white"
					disabled={isPending}
				/>
			</div>

			<div>
				<label
					htmlFor="learning_hours"
					className="block text-sm font-medium text-gray-400 mb-1"
				>
					Learning Hours (h)
				</label>
				<input
					name="learning_hours"
					type="number"
					step="0.5"
					required
					className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white"
					disabled={isPending}
				/>
			</div>

			<div>
				<label
					htmlFor="done"
					className="block text-sm font-medium text-gray-400 mb-1"
				>
					Done
				</label>
				<textarea
					name="done"
					required
					rows={3}
					className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white"
					disabled={isPending}
				/>
			</div>

			<div>
				<label
					htmlFor="todo"
					className="block text-sm font-medium text-gray-400 mb-1"
				>
					ToDo
				</label>
				<textarea
					name="todo"
					required
					rows={3}
					className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white"
					disabled={isPending}
				/>
			</div>

			<div>
				<label
					htmlFor="issue"
					className="block text-sm font-medium text-gray-400 mb-1"
				>
					Issues (Optional)
				</label>
				<textarea
					name="issues"
					rows={2}
					className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white"
					disabled={isPending}
				/>
			</div>

			<button
				type="submit"
				className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				disabled={isPending}
			>
				{isPending ? "Submitting..." : "Submit Report"}
			</button>
		</form>
	);
}
