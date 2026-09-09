import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";
import { and, eq, gt } from "drizzle-orm";
import { getDb } from "@/db";
import { authSessions, users } from "@/db/schema";
import { newSessionToken, sha256 } from "@/lib/security";

export const SESSION_COOKIE = "jasmic_session";
const SESSION_DAYS = 30;

export type AuthenticatedUser = {
  id: string;
  email: string;
  displayName: string;
  role: "USER" | "COACH" | "ADMIN";
};

async function userForToken(token: string | undefined): Promise<AuthenticatedUser | null> {
  if (!token) return null;
  const db = getDb();
  const [result] = await db
    .select({ id: users.id, email: users.email, displayName: users.displayName, role: users.role })
    .from(authSessions)
    .innerJoin(users, eq(authSessions.userId, users.id))
    .where(and(eq(authSessions.tokenHash, sha256(token)), gt(authSessions.expiresAt, new Date())))
    .limit(1);
  if (!result) return null;
  return { ...result, role: result.role as AuthenticatedUser["role"] };
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  return userForToken(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function getRequestUser(request: NextRequest) {
  return userForToken(request.cookies.get(SESSION_COOKIE)?.value);
}

export async function createSession(userId: string) {
  const token = newSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await getDb().insert(authSessions).values({ tokenHash: sha256(token), userId, expiresAt });
  return { token, expiresAt };
}

export function setSessionCookie(response: NextResponse, token: string, expiresAt: Date) {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
    priority: "high",
  });
}

export async function revokeSession(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (token) await getDb().delete(authSessions).where(eq(authSessions.tokenHash, sha256(token)));
}

