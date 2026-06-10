import { NextRequest, NextResponse } from "next/server";

const PROTECTED = ["/todos", "/profile"];
const AUTH_ONLY = ["/login", "/register"];

// Middleware does cookie-existence check only — fast, no crypto, no Edge issues.
// Actual JWT verification (security) happens in every API route handler.
// Client-side AuthGuard handles expired-token redirect after hydration.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasToken = !!req.cookies.get("access_token")?.value;

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const isAuthRoute = AUTH_ONLY.some((p) => pathname.startsWith(p));

  if (isProtected && !hasToken) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && hasToken) {
    const url = req.nextUrl.clone();
    url.pathname = "/todos";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
