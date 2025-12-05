import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Protect /admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // Skip auth check for login page and auth callback
    if (
      request.nextUrl.pathname === "/admin/login" ||
      request.nextUrl.pathname.startsWith("/api/auth")
    ) {
      return NextResponse.next();
    }

    // Check for session cookie
    const sessionCookie = request.cookies.get("cms_session");

    if (!sessionCookie) {
      // Redirect to login if no session
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      const session = JSON.parse(sessionCookie.value);

      // Verify session is not expired
      if (session.expiresAt < Date.now()) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }

      // Verify email domain
      if (!session.email || !session.email.endsWith("@algogi.com")) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    } catch {
      // Invalid session, redirect to login
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};

