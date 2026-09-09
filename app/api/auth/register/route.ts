import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { profiles, users } from "@/db/schema";
import { createSession, setSessionCookie } from "@/lib/auth";
import { apiError, databaseUnavailable, invalidInput, jsonRequest } from "@/lib/api";
import { consumeAuthAttempt, hashPassword, isSameOrigin, requestFingerprint } from "@/lib/security";

export const runtime = "nodejs";

const registrationSchema = z.object({
  displayName: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email().max(320),
  password: z.string().min(12).max(128),
  terms: z.literal(true),
});

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return apiError("Request origin was rejected.", 403);
  if (!jsonRequest(request)) return apiError("Expected JSON.", 415);
  try {
    const parsed = registrationSchema.safeParse(await request.json());
    if (!parsed.success) return invalidInput(parsed.error);
    const fingerprint = requestFingerprint(request, parsed.data.email);
    if (!(await consumeAuthAttempt(fingerprint, 5, 30))) return apiError("Too many attempts. Please wait and try again.", 429);

    const passwordHash = await hashPassword(parsed.data.password);
    const db = getDb();
    const [user] = await db.insert(users).values({ email: parsed.data.email, displayName: parsed.data.displayName, passwordHash }).returning({ id: users.id, displayName: users.displayName });
    try {
      await db.insert(profiles).values({ userId: user.id });
    } catch (error) {
      await db.delete(users).where(eq(users.id, user.id));
      throw error;
    }
    const session = await createSession(user.id);
    const response = NextResponse.json({ user: { id: user.id, displayName: user.displayName } }, { status: 201 });
    setSessionCookie(response, session.token, session.expiresAt);
    return response;
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === "23505") return apiError("An account with this email already exists.", 409);
    return databaseUnavailable(error);
  }
}
