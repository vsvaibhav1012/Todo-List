import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/requireAuth";
import { createTodoSchema, todoQuerySchema } from "@/validation/todo";
import { apiError, fromZodError } from "@/lib/apiError";
import { rateLimit, MUTATION_LIMIT } from "@/lib/rateLimit";
import type { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  let payload;
  try {
    payload = requireAuth(req);
  } catch (e) {
    if (e instanceof AuthError) return apiError("UNAUTHORIZED", "Not authenticated.", 401);
    throw e;
  }

  const { searchParams } = new URL(req.url);
  const queryParsed = todoQuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!queryParsed.success) return fromZodError(queryParsed.error);

  const { completed, priority, search, sortBy, order } = queryParsed.data;

  const where: Prisma.TodoWhereInput = {
    userId: payload.sub,
    ...(completed !== undefined ? { completed: completed === "true" } : {}),
    ...(priority ? { priority } : {}),
    ...(search ? { title: { contains: search, mode: "insensitive" } } : {}),
  };

  const orderBy: Prisma.TodoOrderByWithRelationInput =
    sortBy === "priority"
      ? { priority: order }
      : { [sortBy]: order };

  const todos = await prisma.todo.findMany({ where, orderBy });
  return NextResponse.json({ todos });
}

export async function POST(req: NextRequest) {
  let payload;
  try {
    payload = requireAuth(req);
  } catch (e) {
    if (e instanceof AuthError) return apiError("UNAUTHORIZED", "Not authenticated.", 401);
    throw e;
  }

  const { allowed } = rateLimit(`todos:create:${payload.sub}`, MUTATION_LIMIT);
  if (!allowed) return apiError("RATE_LIMITED", "Too many requests.", 429);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("INVALID_JSON", "Invalid JSON.", 400);
  }

  const parsed = createTodoSchema.safeParse(body);
  if (!parsed.success) return fromZodError(parsed.error);

  const todo = await prisma.todo.create({
    data: {
      ...parsed.data,
      userId: payload.sub,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
    },
  });

  return NextResponse.json({ todo }, { status: 201 });
}
