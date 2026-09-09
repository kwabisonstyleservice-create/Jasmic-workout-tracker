import { eq, inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { auditEvents, exercises, setLogs, workoutSessions, workoutTemplates } from "@/db/schema";
import { getRequestUser } from "@/lib/auth";
import { apiError, databaseUnavailable, invalidInput, jsonRequest } from "@/lib/api";
import { isSameOrigin } from "@/lib/security";

export const runtime = "nodejs";

const workoutSchema = z.object({
  categoryId: z.string().min(1).max(80),
  name: z.string().trim().min(2).max(100),
  durationSeconds: z.number().int().min(0).max(86_400).optional(),
  sets: z.array(z.object({
    exerciseSlug: z.string().min(1).max(120),
    setNumber: z.number().int().min(1).max(50),
    reps: z.number().int().min(0).max(500),
    weightKg: z.number().min(0).max(2_000),
  })).max(500),
});

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return apiError("Request origin was rejected.", 403);
  if (!jsonRequest(request)) return apiError("Expected JSON.", 415);
  try {
    const user = await getRequestUser(request);
    if (!user) return apiError("Sign in required.", 401);
    const parsed = workoutSchema.safeParse(await request.json());
    if (!parsed.success) return invalidInput(parsed.error);
    const db = getDb();
    const slugs = [...new Set(parsed.data.sets.map((set) => set.exerciseSlug))];
    const [knownExercises, template] = await Promise.all([
      slugs.length ? db.select({ id: exercises.id, slug: exercises.slug }).from(exercises).where(inArray(exercises.slug, slugs)) : Promise.resolve([]),
      db.select({ id: workoutTemplates.id }).from(workoutTemplates).where(eq(workoutTemplates.id, parsed.data.categoryId)).limit(1),
    ]);
    const idBySlug = new Map(knownExercises.map((exercise) => [exercise.slug, exercise.id]));
    if (knownExercises.length !== slugs.length) return apiError("One or more exercises are not available.", 422);
    const [session] = await db.insert(workoutSessions).values({ userId: user.id, templateId: template[0]?.id, name: parsed.data.name, startedAt: new Date(), completedAt: new Date(), durationSeconds: parsed.data.durationSeconds }).returning({ id: workoutSessions.id });
    if (parsed.data.sets.length) {
      await db.insert(setLogs).values(parsed.data.sets.map((set) => ({ sessionId: session.id, exerciseId: idBySlug.get(set.exerciseSlug)!, setNumber: set.setNumber, reps: set.reps, weightKg: String(set.weightKg) })));
    }
    await db.insert(auditEvents).values({ actorUserId: user.id, action: "workout.completed", targetType: "workout_session", targetId: session.id, metadata: { setCount: parsed.data.sets.length } });
    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    return databaseUnavailable(error);
  }
}
