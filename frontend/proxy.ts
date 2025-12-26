import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
	const isLoggedIn = !!req.auth;
	const isAuthRoute = req.nextUrl.pathname.startsWith("/api/auth");
	const isLoginPage = req.nextUrl.pathname === "/login";

	if (!isLoggedIn && !isAuthRoute && !isLoginPage) {
		return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
	}

	if (isLoggedIn && isLoginPage) {
		return NextResponse.redirect(new URL("/", req.nextUrl.origin));
	}

	return NextResponse.next();
});

export const config = {
	matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
