import { NextRequest } from "next/server";
import { verifyAccessToken, type AccessTokenPayload } from "./auth";
import { ACCESS_COOKIE } from "./cookies";

export function requireAuth(req: NextRequest): AccessTokenPayload {
  const token = req.cookies.get(ACCESS_COOKIE)?.value;
  if (!token) throw new AuthError();
  try {
    return verifyAccessToken(token);
  } catch {
    throw new AuthError();
  }
}

export class AuthError extends Error {
  constructor() {
    super("Unauthorized");
  }
}
