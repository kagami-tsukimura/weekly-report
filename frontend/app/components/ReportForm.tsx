"use client";
import { useActionState } from "react";

import { createReport, type FormState } from "@/app/actions";

const initialState: FormState = {
	message: "",
};

export default function ReportForm() {
	// state: アクションの結果メッセージなど
	// formAction: formタグのactionに渡す関数
	// isPending: 送信中かどうか (これでボタンを無効化できる)
	const [state, formAction, isPending] = useActionState(
		createReport,
		initialState,
	);

	return (
		<form
			action={formAction}
			className="bg-gray-900 border border-gray-800 p-6 rounded-xl space-y-4"
		>
			<h2 className="text-xl font-bold mb-4 text-gray-100">
				Create New Report
			</h2>

			{/* 結果メッセージ表示エリア */}
			{state.message && (
				<div
					className={`p-3 rounded ${state.error ? "bg-red-900/50 text-red-200" : "bg-green-900/50 text-green-200"}`}
				>
					{state.message}
				</div>
			)}

			{/* 入力項目 (以前と同じですが、disabled={isPending} をつけられるのが強み) */}
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

			{/* ... (他項目も同様に disabled={isPending} をつける) ... */}

			{/* Learning Hours */}
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

			{/* Done */}
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

			{/* ToDo */}
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

			{/* Issues (Optional) */}
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
