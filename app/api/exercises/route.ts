import { asc, eq, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { auditEvents, exercises } from "@/db/schema";
import { getRequestUser } from "@/lib/auth";
import { apiError, databaseUnavailable, invalidInput, jsonRequest } from "@/lib/api";
import { isSameOrigin } from "@/lib/security";

export const runtime = "nodejs";

const exerciseSchema = z.object({
  name: z.string().trim().min(2).max(100),
  muscleGroup: z.string().trim().min(2).max(40),
  equipment: z.string().trim().min(2).max(60),
  sets: z.coerce.number().int().min(1).max(20),
  reps: z.string().trim().min(1).max(30),
});

function slugify(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80);
}

export async function GET(request: NextRequest) {
  try {
    const user = await getRequestUser(request);
    if (!user) return apiError("Sign in required.", 401);
    const rows = await getDb().select().from(exercises).where(or(eq(exercises.isSystem, true), eq(exercises.createdBy, user.id))).orderBy(asc(exercises.muscleGroup), asc(exercises.name));
    return NextResponse.json({ exercises: rows });
  } catch (error) {
    return databaseUnavailable(error);
  }
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return apiError("Request origin was rejected.", 403);
  if (!jsonRequest(request)) return apiError("Expected JSON.", 415);
  try {
    const user = await getRequestUser(request);
    if (!user) return apiError("Sign in required.", 401);
    const parsed = exerciseSchema.safeParse(await request.json());
    if (!parsed.success) return invalidInput(parsed.error);
    const id = crypto.randomUUID();
    const [exercise] = await getDb().insert(exercises).values({ id, slug: `${slugify(parsed.data.name)}-${id.slice(0, 8)}`, name: parsed.data.name, muscleGroup: parsed.data.muscleGroup, equipment: parsed.data.equipment, defaultSets: parsed.data.sets, defaultReps: parsed.data.reps, createdBy: user.id }).returning();
    await getDb().insert(auditEvents).values({ actorUserId: user.id, action: "exercise.created", targetType: "exercise", targetId: exercise.id });
    return NextResponse.json({ exercise }, { status: 201 });
  } catch (error) {
    return databaseUnavailable(error);
  }
}
