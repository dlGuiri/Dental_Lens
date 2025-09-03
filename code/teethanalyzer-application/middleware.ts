// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const { pathname } = req.nextUrl;

  // If logged in and trying to access /login → redirect to homepage
  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL("/", req.url));
  }


  // Allow requests to login, api/auth, static files, and public assets
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/public")
  ) {
    return NextResponse.next();
  }

  // If no token and trying to access a protected route → redirect to login
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Otherwise, continue
  return NextResponse.next();
}

// Apply middleware only to specific routes
export const config = {
  matcher: [
    "/((?!api/auth|login|_next|static|favicon.ico).*)", // protect everything except login & auth routes
  ],
};
