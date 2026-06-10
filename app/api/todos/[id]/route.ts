import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/requireAuth";
import { updateTodoSchema } from "@/validation/todo";
import { apiError, fromZodError } from "@/lib/apiError";
import { rateLimit, MUTATION_LIMIT } from "@/lib/rateLimit";

type RouteContext = { params: { id: string } };

async function getTodoOwned(todoId: string, userId: string) {
  const todo = await prisma.todo.findFirst({ where: { id: todoId, userId } });
  return todo; // null if not found OR not owned — caller returns 404 either way
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  let payload;
  try {
    payload = requireAuth(req);
  } catch (e) {
    if (e instanceof AuthError) return apiError("UNAUTHORIZED", "Not authenticated.", 401);
    throw e;
  }

  const todo = await getTodoOwned(params.id, payload.sub);
  if (!todo) return apiError("NOT_FOUND", "Todo not found.", 404);

  return NextResponse.json({ todo });
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  let payload;
  try {
    payload = requireAuth(req);
  } catch (e) {
    if (e instanceof AuthError) return apiError("UNAUTHORIZED", "Not authenticated.", 401);
    throw e;
  }

  const { allowed } = rateLimit(`todos:update:${payload.sub}`, MUTATION_LIMIT);
  if (!allowed) return apiError("RATE_LIMITED", "Too many requests.", 429);

  const existing = await getTodoOwned(params.id, payload.sub);
  if (!existing) return apiError("NOT_FOUND", "Todo not found.", 404);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("INVALID_JSON", "Invalid JSON.", 400);
  }

  const parsed = updateTodoSchema.safeParse(body);
  if (!parsed.success) return fromZodError(parsed.error);

  const todo = await prisma.todo.update({
    where: { id: params.id },
    data: {
      ...parsed.data,
      dueDate: parsed.data.dueDate !== undefined
        ? (parsed.data.dueDate ? new Date(parsed.data.dueDate) : null)
        : undefined,
    },
  });

  return NextResponse.json({ todo });
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  let payload;
  try {
    payload = requireAuth(req);
  } catch (e) {
    if (e instanceof AuthError) return apiError("UNAUTHORIZED", "Not authenticated.", 401);
    throw e;
  }

  const { allowed } = rateLimit(`todos:delete:${payload.sub}`, MUTATION_LIMIT);
  if (!allowed) return apiError("RATE_LIMITED", "Too many requests.", 429);

  const existing = await getTodoOwned(params.id, payload.sub);
  if (!existing) return apiError("NOT_FOUND", "Todo not found.", 404);

  await prisma.todo.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
