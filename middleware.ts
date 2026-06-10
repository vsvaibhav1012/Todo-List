import { NextRequest, NextResponse } from "next/server";
import { verifyAccessTokenEdge } from "@/lib/authEdge";

const PROTECTED = ["/todos", "/profile"];
const AUTH_ONLY = ["/login", "/register"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const accessToken = req.cookies.get("access_token")?.value;

  let isAuthed = false;
  if (accessToken) {
    try {
      await verifyAccessTokenEdge(accessToken);
      isAuthed = true;
    } catch {
      isAuthed = false;
    }
  }

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const isAuthRoute = AUTH_ONLY.some((p) => pathname.startsWith(p));

  if (isProtected && !isAuthed) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && isAuthed) {
    const url = req.nextUrl.clone();
    url.pathname = "/todos";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
