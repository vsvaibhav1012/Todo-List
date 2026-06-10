import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/validation/auth";
import { signAccessToken, signRefreshToken, hashToken, refreshTokenExpiresAt } from "@/lib/auth";
import { setAuthCookies } from "@/lib/cookies";
import { apiError, fromZodError } from "@/lib/apiError";
import { rateLimit, AUTH_LIMIT } from "@/lib/rateLimit";
import { logger } from "@/lib/logger";

const INVALID_CREDS = apiError("INVALID_CREDENTIALS", "Invalid credentials.", 401);

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("INVALID_JSON", "Request body must be valid JSON.", 400);
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return fromZodError(parsed.error);

  const { email, password } = parsed.data;

  // Rate limit per IP and per email
  const ipResult = rateLimit(`login:ip:${ip}`, AUTH_LIMIT);
  const emailResult = rateLimit(`login:email:${email}`, AUTH_LIMIT);
  if (!ipResult.allowed || !emailResult.allowed) {
    return apiError("RATE_LIMITED", "Too many login attempts. Try again later.", 429);
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Always run bcrypt to prevent timing attacks revealing email existence
  const hash = user?.passwordHash ?? "$2b$12$invalidhashfortimingprotection00000000000000000000";
  const valid = await bcrypt.compare(password, hash);

  if (!user || !valid) return INVALID_CREDS;

  const accessToken = signAccessToken({ sub: user.id, email: user.email });
  const refreshToken = signRefreshToken(user.id);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: refreshTokenExpiresAt(),
    },
  });

  logger.info({ userId: user.id }, "User logged in");

  const res = NextResponse.json({
    user: { id: user.id, email: user.email, displayName: user.displayName, createdAt: user.createdAt },
  });
  setAuthCookies(res, accessToken, refreshToken);
  return res;
}
