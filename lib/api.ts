import { NextResponse, type NextRequest } from "next/server";
import type { ZodError } from "zod";

export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function invalidInput(error: ZodError) {
  return NextResponse.json({ error: "Please check the highlighted information.", fields: error.flatten().fieldErrors }, { status: 422 });
}

export function databaseUnavailable(error: unknown) {
  console.error("Database request failed", error);
  return NextResponse.json({ error: "The service is temporarily unavailable." }, { status: 503 });
}

export function jsonRequest(request: NextRequest) {
  return request.headers.get("content-type")?.toLowerCase().includes("application/json") ?? false;
}
