export interface User {
	id: number;
	name: string;
}

export interface Report {
	id: number;
	user_id: number;
	week_start: string;
	done: string;
	todo: string;
	issues: string | null;
	learning_hours: number | null;
	created_at: string;
	updated_at: string;
}

export interface ReportCreate {
	user_id: number;
	week_start: string;
	done: string;
	todo: string;
	issues: string | null;
	learning_hours: number | null;
}
