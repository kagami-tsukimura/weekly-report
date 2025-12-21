import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
	providers: [GitHub, Google],
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
