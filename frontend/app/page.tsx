import Image from "next/image";
import { auth, signOut } from "@/auth";
import { getReports } from "@/lib/api";
import type { Report } from "@/types";
import ReportForm from "./components/ReportForm";

const UNKNOWN_ERROR_MESSAGE: string = "Unknown error occured";

export default async function Home() {
	const session = await auth();

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
			<div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
				<h1 className="text-4xl font-bold">Weekly Report</h1>
				<div className="group relative flex items-center gap-4">
					{session?.user?.image ? (
						<Image
							src={session.user.image}
							alt="avatar"
							width={48}
							height={48}
							className="cursor-pointer rounded-full"
						/>
					) : (
						<div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gray-600 text-sm text-white">
							{session?.user?.name?.charAt(0) ?? "?"}
						</div>
					)}
					{/* Dropdown on hover */}
					<div className="pointer-events-none absolute right-0 top-full pt-4 w-24 rounded-lg bg-gray-800 p-2 text-center opacity-0 shadow-lg transition group-hover:pointer-events-auto group-hover:opacity-100">
						<p className="mb-2 border-b border-gray-700 px-3 py-2 text-sm text-gray-300">
							{session?.user?.name}
						</p>
						<form
							action={async () => {
								"use server";
								await signOut({ redirectTo: "/login" });
							}}
						>
							<button
								type="submit"
								className="rounded-lg bg-gray-500 px-4 py-2 text-white transition hover:bg-gray-600"
							>
								Logout
							</button>
						</form>
					</div>
				</div>
			</div>
			<div className="mb-12">
				<ReportForm />
			</div>
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
