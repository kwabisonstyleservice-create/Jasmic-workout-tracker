import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { createSession, setSessionCookie } from "@/lib/auth";
import { apiError, databaseUnavailable, invalidInput, jsonRequest } from "@/lib/api";
import { clearAuthAttempts, consumeAuthAttempt, isSameOrigin, requestFingerprint, verifyPassword } from "@/lib/security";

export const runtime = "nodejs";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(320),
  password: z.string().min(1).max(128),
});

const DUMMY_PASSWORD_HASH = "scrypt$16384$8$1$AAAAAAAAAAAAAAAAAAAAAA$HoI9AdHDBAJOrZH2petF6ja67mWaYCPuGUooJIIpJOh3JjgGWnZiFZXr7lgCtP8IGWZolm1ugcmnFg4XwqTvHw";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return apiError("Request origin was rejected.", 403);
  if (!jsonRequest(request)) return apiError("Expected JSON.", 415);
  try {
    const parsed = loginSchema.safeParse(await request.json());
    if (!parsed.success) return invalidInput(parsed.error);
    const fingerprint = requestFingerprint(request, parsed.data.email);
    if (!(await consumeAuthAttempt(fingerprint))) return apiError("Too many attempts. Please wait and try again.", 429);

    const [user] = await getDb().select({ id: users.id, displayName: users.displayName, passwordHash: users.passwordHash }).from(users).where(eq(users.email, parsed.data.email)).limit(1);
    const validPassword = await verifyPassword(parsed.data.password, user?.passwordHash ?? DUMMY_PASSWORD_HASH);
    if (!user || !validPassword) return apiError("Email or password is incorrect.", 401);

    await clearAuthAttempts(fingerprint);
    const session = await createSession(user.id);
    const response = NextResponse.json({ user: { id: user.id, displayName: user.displayName } });
    setSessionCookie(response, session.token, session.expiresAt);
    return response;
  } catch (error) {
    return databaseUnavailable(error);
  }
}
