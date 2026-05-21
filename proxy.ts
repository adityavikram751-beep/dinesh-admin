import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const authCookieKey = "fitadmin_auth";

const protectedRoutes = [
  "/enquiry",
  "/contact",
  "/blog",
  "/settings",
  "/gym-plan",
  "/banner",
];

function isProtectedPath(pathname: string) {
  return protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoggedIn = request.cookies.get(authCookieKey)?.value === "true";

  if (isProtectedPath(pathname) && !isLoggedIn) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);

    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/login" && isLoggedIn) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/enquiry";
    dashboardUrl.search = "";

    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/enquiry/:path*",
    "/contact/:path*",
    "/blog/:path*",
    "/settings/:path*",
    "/gym-plan/:path*",
    "/banner/:path*",
    "/login",
  ],
};
