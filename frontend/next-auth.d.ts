import type { DefaultSession } from "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
	interface Session {
		user: {
			authId: string;
		} & DefaultSession["user"];
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		authId?: string;
	}
}
