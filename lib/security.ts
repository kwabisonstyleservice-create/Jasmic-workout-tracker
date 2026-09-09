import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { authRateLimits } from "@/db/schema";

const SCRYPT_N = 16_384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LENGTH = 64;

function deriveKey(password: string, salt: Buffer) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P, maxmem: 64 * 1024 * 1024 }, (error, key) => {
      if (error) reject(error);
      else resolve(key as Buffer);
    });
  });
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const key = await deriveKey(password, salt);
  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt.toString("base64url")}$${key.toString("base64url")}`;
}

export async function verifyPassword(password: string, encoded: string) {
  const [algorithm, n, r, p, saltValue, hashValue] = encoded.split("$");
  if (algorithm !== "scrypt" || !saltValue || !hashValue || Number(n) !== SCRYPT_N || Number(r) !== SCRYPT_R || Number(p) !== SCRYPT_P) return false;
  const expected = Buffer.from(hashValue, "base64url");
  const actual = await deriveKey(password, Buffer.from(saltValue, "base64url"));
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function newSessionToken() {
  return randomBytes(32).toString("base64url");
}

export function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function requestFingerprint(request: NextRequest, email: string) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip") || "unknown";
  return sha256(`${ip}|${email.toLowerCase()}`);
}

export async function consumeAuthAttempt(key: string, limit = 10, windowMinutes = 15) {
  const db = getDb();
  const [record] = await db
    .insert(authRateLimits)
    .values({ key, count: 1, resetAt: new Date(Date.now() + windowMinutes * 60_000) })
    .onConflictDoUpdate({
      target: authRateLimits.key,
      set: {
        count: sql`case when ${authRateLimits.resetAt} < now() then 1 else ${authRateLimits.count} + 1 end`,
        resetAt: sql`case when ${authRateLimits.resetAt} < now() then now() + ${`${windowMinutes} minutes`}::interval else ${authRateLimits.resetAt} end`,
      },
    })
    .returning({ count: authRateLimits.count });
  return (record?.count ?? limit + 1) <= limit;
}

export async function clearAuthAttempts(key: string) {
  await getDb().delete(authRateLimits).where(eq(authRateLimits.key, key));
}

export function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return process.env.NODE_ENV !== "production";
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
