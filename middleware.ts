import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;

  // Protect the staff dashboard: require an authenticated staff session
  if (pathname.startsWith("/staff/dashboard")) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/staff/sign-in", request.url));
    }
  }

  // Redirect authenticated staff away from sign-in page
  if (pathname === "/staff/sign-in" && sessionCookie) {
    return NextResponse.redirect(new URL("/staff/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/staff/dashboard/:path*", "/staff/sign-in"],
};
