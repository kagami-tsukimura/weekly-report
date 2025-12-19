import { getReports } from "@/lib/api";
import type { Report } from "@/types";

const UNKNOWN_ERROR_MESSAGE: string = "Unknown error occured";

// コンポーネント自体を async にする
export default async function Home() {
	let reports: Report[] = [];
	let error: string = "";

	try {
		reports = await getReports();
	} catch (e) {
		if (e instanceof Error) {
			error = e.message;
		} else {
			error = UNKNOWN_ERROR_MESSAGE;
		}
	}

	if (error) {
		return <p className="text-4xl font-bold text-red-500 mb-4 p-8">{error}</p>;
	}

	return (
		<main className="p-8 max-w-4xl mx-auto">
			<h1 className="text-4xl font-bold mt-20 mb-4">Reports</h1>
			<div className="flex flex-col gap-6">
				{reports.map((report) => (
					<div
						key={report.id}
						className="border border-gray-700 rounded-xl p-6"
					>
						<div className="text-xl font-bold text-gray-100 mb-4">
							Week Of {report.week_start}
						</div>
						<div className="space-y-3">
							<div>
								<span className="font-bold text-green-400 mr-2">
									Done✅
									<span className="text-gray-300 ml-2">{report.done}</span>
								</span>
							</div>
							<div>
								<span className="font-bold text-amber-400 mr-2">
									ToDo🚧
									<span className="text-gray-300 ml-2">{report.todo}</span>
								</span>
							</div>
							<div>
								<span className="font-bold text-blue-400 mr-2">
									Learning📘
									<span className="text-gray-300 ml-2">
										{report.learning_hours}h
									</span>
								</span>
							</div>
							<div>
								<span className="font-bold text-red-400 mr-2">
									Issue🚨
									<span className="text-gray-300 ml-2">{report.issues}</span>
								</span>
							</div>
						</div>
					</div>
				))}
			</div>
		</main>
	);
}
