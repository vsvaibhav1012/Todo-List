import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRefreshToken, hashToken } from "@/lib/auth";
import { clearAuthCookies, getRefreshToken } from "@/lib/cookies";
import { requireAuth, AuthError } from "@/lib/requireAuth";
import { apiError } from "@/lib/apiError";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    requireAuth(req);
  } catch (e) {
    if (e instanceof AuthError) return apiError("UNAUTHORIZED", "Not authenticated.", 401);
  }

  const refreshToken = req.cookies.get("refresh_token")?.value ?? getRefreshToken();

  if (refreshToken) {
    try {
      const payload = verifyRefreshToken(refreshToken);
      const tokenHash = hashToken(refreshToken);
      await prisma.refreshToken.updateMany({
        where: { userId: payload.sub, tokenHash },
        data: { revoked: true },
      });
      logger.info({ userId: payload.sub }, "User logged out");
    } catch {
      // Token invalid — still clear cookies
    }
  }

  const res = NextResponse.json({ ok: true });
  clearAuthCookies(res);
  return res;
}
