import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/requireAuth";
import { apiError } from "@/lib/apiError";

export async function GET(req: NextRequest) {
  let payload;
  try {
    payload = requireAuth(req);
  } catch (e) {
    if (e instanceof AuthError) return apiError("UNAUTHORIZED", "Not authenticated.", 401);
    throw e;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, displayName: true, createdAt: true },
  });

  if (!user) return apiError("UNAUTHORIZED", "User not found.", 401);

  return NextResponse.json({ user });
}
