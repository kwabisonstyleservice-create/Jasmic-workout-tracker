import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { auditEvents, users } from "@/db/schema";
import { getRequestUser, SESSION_COOKIE } from "@/lib/auth";
import { apiError, databaseUnavailable, invalidInput, jsonRequest } from "@/lib/api";
import { consumeAuthAttempt, isSameOrigin, requestFingerprint, verifyPassword } from "@/lib/security";

export const runtime = "nodejs";

const deletionSchema = z.object({ password: z.string().min(1).max(128), confirmation: z.literal("DELETE") });

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return apiError("Request origin was rejected.", 403);
  if (!jsonRequest(request)) return apiError("Expected JSON.", 415);
  try {
    const currentUser = await getRequestUser(request);
    if (!currentUser) return apiError("Sign in required.", 401);
    const parsed = deletionSchema.safeParse(await request.json());
    if (!parsed.success) return invalidInput(parsed.error);
    const fingerprint = requestFingerprint(request, currentUser.email);
    if (!(await consumeAuthAttempt(fingerprint, 5, 30))) return apiError("Too many attempts. Please wait and try again.", 429);
    const db = getDb();
    const [user] = await db.select({ passwordHash: users.passwordHash }).from(users).where(eq(users.id, currentUser.id)).limit(1);
    if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) return apiError("The password is incorrect.", 401);
    await db.insert(auditEvents).values({ actorUserId: currentUser.id, action: "account.deleted", targetType: "user", targetId: currentUser.id });
    await db.delete(users).where(eq(users.id, currentUser.id));
    const response = NextResponse.json({ deleted: true });
    response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
    return response;
  } catch (error) {
    return databaseUnavailable(error);
  }
}
