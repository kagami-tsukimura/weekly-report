"use client";

import { useState } from "react";
import type { Report } from "@/types";
import ReportItem from "./ReportItem";

type Props = {
	reports: Report[];
};

export default function ReportList({ reports }: Props) {
	const [toast, setToast] = useState<string | null>(null);

	const showToast = (message: string) => {
		setToast(message);
		setTimeout(() => setToast(null), 3000);
	};

	return (
		<div>
			{/* Reports タイトルとトースト */}
			<div className="relative mt-20 mb-4">
				<h1 className="text-4xl font-bold">Reports</h1>
				{toast && (
					<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-green-900/80 text-green-200 px-4 py-2 rounded-lg text-sm">
						{toast}
					</div>
				)}
			</div>
			<div className="flex flex-col gap-6">
				{reports.map((report) => (
					<ReportItem
						key={report.id}
						report={report}
						onDeleteSuccess={() => showToast("Report deleted successfully!")}
					/>
				))}
			</div>
		</div>
	);
}
