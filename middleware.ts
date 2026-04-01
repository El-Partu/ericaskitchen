import { NextRequest, NextResponse } from "next/server";

// Routes that logged-in users should not access
const AUTH_ROUTES = ["/login", "/signup", "/forgot-password"];

function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get("accessToken")?.value;
  const isAuthenticated = Boolean(accessToken);

  if (isAuthenticated && matchesRoute(pathname, AUTH_ROUTES)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images/|.*\\.svg$|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.webp$).*)",
  ],
};
