import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const IS_PROD = process.env.NODE_ENV === "production";
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined;

const BASE_OPTS = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: "strict" as const,
  path: "/",
  ...(COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {}),
};

export const ACCESS_COOKIE = "access_token";
export const REFRESH_COOKIE = "refresh_token";

export function setAuthCookies(
  res: NextResponse,
  accessToken: string,
  refreshToken: string
): void {
  res.cookies.set(ACCESS_COOKIE, accessToken, {
    ...BASE_OPTS,
    maxAge: 15 * 60,
  });
  res.cookies.set(REFRESH_COOKIE, refreshToken, {
    ...BASE_OPTS,
    maxAge: 7 * 24 * 60 * 60,
    path: "/api/auth",
  });
}

export function clearAuthCookies(res: NextResponse): void {
  res.cookies.set(ACCESS_COOKIE, "", { ...BASE_OPTS, maxAge: 0 });
  res.cookies.set(REFRESH_COOKIE, "", { ...BASE_OPTS, maxAge: 0, path: "/api/auth" });
}

export function getAccessToken(): string | undefined {
  return cookies().get(ACCESS_COOKIE)?.value;
}

export function getRefreshToken(): string | undefined {
  return cookies().get(REFRESH_COOKIE)?.value;
}
