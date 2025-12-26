"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { deleteReport, updateReport } from "@/app/actions";
import type { Report } from "@/types";
import ReportForm from "./ReportForm";

type Props = {
	report: Report;
	onDeleteSuccess?: () => void;
};

export default function ReportItem({ report, onDeleteSuccess }: Props) {
	const [isEditing, setIsEditing] = useState(false);
	const [toast, setToast] = useState<string | null>(null);
	const router = useRouter();
	const updateAction = updateReport.bind(null, report.id);

	const showToast = (message: string) => {
		setToast(message);
		setTimeout(() => setToast(null), 3000);
	};

	const handleDelete = async () => {
		if (confirm("Delete this report?")) {
			const res = await deleteReport(report.id);
			if (res.message.includes("deleted")) {
				onDeleteSuccess?.();
				router.refresh();
			} else {
				alert(res.message);
			}
		}
	};

	const handleUpdateSuccess = () => {
		setIsEditing(false);
		router.refresh();
		showToast("Report updated successfully!");
	};

	return (
		<div className="border border-gray-700 rounded-xl p-6 relative group">
			{/* Update 用トースト */}
			{toast && (
				<div className="absolute top-4 left-1/2 -translate-x-1/2 bg-green-900/80 text-green-200 px-4 py-2 rounded-lg text-sm z-10">
					{toast}
				</div>
			)}
			{/* 右上の操作ボタン (ホバー時のみ表示) */}
			<div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
				<button
					type="button"
					onClick={() => setIsEditing(true)}
					className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
				>
					Edit
				</button>
				<button
					type="button"
					onClick={handleDelete}
					className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
				>
					Delete
				</button>
			</div>

			{/* レポート内容表示 */}
			<div className="text-xl font-bold text-gray-100 mb-4">
				Week Of {report.week_start}
			</div>
			<div className="space-y-3">
				<div>
					<span className="font-bold text-green-400 mr-2">
						Done✅
						<span className="text-gray-300 ml-2 whitespace-pre-wrap">
							{report.done}
						</span>
					</span>
				</div>
				<div>
					<span className="font-bold text-amber-400 mr-2">
						ToDo🚧
						<span className="text-gray-300 ml-2 whitespace-pre-wrap">
							{report.todo}
						</span>
					</span>
				</div>
				<div>
					<span className="font-bold text-blue-400 mr-2">
						Learning📘
						<span className="text-gray-300 ml-2">{report.learning_hours}h</span>
					</span>
				</div>
				<div>
					<span className="font-bold text-red-400 mr-2">
						Issue🚨
						<span className="text-gray-300 ml-2 whitespace-pre-wrap">
							{report.issues}
						</span>
					</span>
				</div>
			</div>

			{/* 編集モーダル */}
			{isEditing && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
					<div className="max-w-md w-full relative bg-gray-900 rounded-xl">
						<button
							type="button"
							onClick={() => setIsEditing(false)}
							className="absolute top-2 right-4 text-gray-400 hover:text-white text-2xl"
						>
							&times;
						</button>
						<ReportForm
							key={isEditing ? "editing" : "idle"}
							action={updateAction}
							initialData={{
								week_start: report.week_start.toString(),
								learning_hours: report.learning_hours ?? 0.0,
								done: report.done,
								todo: report.todo,
								issues: report.issues ?? undefined,
							}}
							onSuccess={handleUpdateSuccess}
						/>
					</div>
				</div>
			)}
		</div>
	);
}
