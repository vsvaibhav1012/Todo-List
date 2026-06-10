import { NextResponse } from "next/server";
import { ZodError } from "zod";

export interface ApiErrorShape {
  error: { code: string; message: string };
}

export function apiError(code: string, message: string, status: number): NextResponse<ApiErrorShape> {
  return NextResponse.json({ error: { code, message } }, { status });
}

export function fromZodError(err: ZodError): NextResponse<ApiErrorShape> {
  const message = err.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ");
  return apiError("VALIDATION_ERROR", message, 400);
}
