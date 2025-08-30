// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Allow requests to login, api/auth, static files, public assets, and role-selection
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/role-selection") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/public") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // If no token, redirect to login
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // If logged in but trying to access /login → redirect based on role or to role-selection
  if (token && pathname === "/login") {
    if (!token.role) {
      return NextResponse.redirect(new URL("/role-selection", req.url));
    }
    
    const redirectPath = token.role === "patient" ? "/" : "/clinic/dashboard";
    return NextResponse.redirect(new URL(redirectPath, req.url));
  }

  // If user has no role, redirect to role-selection (except for API routes)
  if (token && !token.role && !pathname.startsWith("/api/")) {
    return NextResponse.redirect(new URL("/role-selection", req.url));
  }

  // Role-based route protection
  if (token && token.role) {
    // Dentist trying to access patient routes
    if (token.role === "dentist" && pathname === "/") {
      return NextResponse.redirect(new URL("/clinic/dashboard", req.url));
    }
    
    // Dentist trying to access patient-specific pages
    if (token.role === "dentist" && (
      pathname.startsWith("/scan") ||
      pathname.startsWith("/recommended") ||
      pathname.startsWith("/calendar") ||
      pathname.startsWith("/chatbot")
    )) {
      return NextResponse.redirect(new URL("/clinic/dashboard", req.url));
    }

    // Patient trying to access dentist routes
    if (token.role === "patient" && pathname.startsWith("/clinic/")) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Continue with the request
  return NextResponse.next();
}

// Apply middleware to specific routes
export const config = {
  matcher: [
    "/((?!api/auth|_next|static|favicon.ico).*)", // Protect everything except auth and static files
  ],
};