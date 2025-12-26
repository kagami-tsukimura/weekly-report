import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
	providers: [
		GitHub,
		Google,
		Credentials({
			name: "Test Login",
			credentials: {
				username: { label: "Username", type: "text" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (process.env.APP_ENV !== "test") {
					return null;
				}
				if (
					credentials?.username === "testuser" &&
					credentials?.password === "password"
				) {
					return {
						id: "test-user-id",
						name: "Test User",
						email: "test@example.com",
					};
				}
				return null;
			},
		}),
	],
	callbacks: {
		async jwt({ token, account }) {
			if (account) {
				token.authId = `${account.provider}:${account.providerAccountId}`;
			}
			return token;
		},
		async session({ session, token }) {
			session.user.authId = token.authId as string;
			return session;
		},
	},
});
