import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  verifyRefreshToken,
  signAccessToken,
  signRefreshToken,
  hashToken,
  refreshTokenExpiresAt,
} from "@/lib/auth";
import { setAuthCookies, clearAuthCookies } from "@/lib/cookies";
import { apiError } from "@/lib/apiError";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  const rawToken = req.cookies.get("refresh_token")?.value;
  if (!rawToken) return apiError("UNAUTHORIZED", "No refresh token.", 401);

  let payload: { sub: string };
  try {
    payload = verifyRefreshToken(rawToken);
  } catch {
    return apiError("UNAUTHORIZED", "Invalid or expired refresh token.", 401);
  }

  const tokenHash = hashToken(rawToken);
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });

  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    // Token reuse or theft — revoke entire family
    if (stored) {
      await prisma.refreshToken.updateMany({
        where: { userId: payload.sub },
        data: { revoked: true },
      });
      logger.warn({ userId: payload.sub }, "Refresh token reuse detected — all tokens revoked");
    }
    const res = apiError("UNAUTHORIZED", "Session invalid. Please log in again.", 401);
    clearAuthCookies(res as unknown as NextResponse);
    return res;
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) return apiError("UNAUTHORIZED", "User not found.", 401);

  // Rotate: revoke old, issue new
  await prisma.refreshToken.update({ where: { tokenHash }, data: { revoked: true } });

  const newAccessToken = signAccessToken({ sub: user.id, email: user.email });
  const newRefreshToken = signRefreshToken(user.id);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(newRefreshToken),
      expiresAt: refreshTokenExpiresAt(),
    },
  });

  const res = NextResponse.json({ ok: true });
  setAuthCookies(res, newAccessToken, newRefreshToken);
  return res;
}
