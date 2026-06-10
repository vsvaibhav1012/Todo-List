import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/validation/auth";
import { signAccessToken, signRefreshToken, hashToken, refreshTokenExpiresAt } from "@/lib/auth";
import { setAuthCookies } from "@/lib/cookies";
import { apiError, fromZodError } from "@/lib/apiError";
import { rateLimit, AUTH_LIMIT } from "@/lib/rateLimit";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { allowed } = rateLimit(`register:${ip}`, AUTH_LIMIT);
  if (!allowed) return apiError("RATE_LIMITED", "Too many requests. Try again later.", 429);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("INVALID_JSON", "Request body must be valid JSON.", 400);
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) return fromZodError(parsed.error);

  const { email, password, displayName } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return apiError("EMAIL_TAKEN", "Email is already registered.", 409);

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { email, passwordHash, displayName },
    select: { id: true, email: true, displayName: true, createdAt: true },
  });

  const accessToken = signAccessToken({ sub: user.id, email: user.email });
  const refreshToken = signRefreshToken(user.id);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: refreshTokenExpiresAt(),
    },
  });

  logger.info({ userId: user.id }, "User registered");

  const res = NextResponse.json({ user }, { status: 201 });
  setAuthCookies(res, accessToken, refreshToken);
  return res;
}
