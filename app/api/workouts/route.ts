import { and, eq, inArray, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { workoutSchema } from "@/lib/workout-validation";
import { getDb } from "@/db";
import { auditEvents, exercises, setLogs, workoutSessions, workoutTemplates } from "@/db/schema";
import { getRequestUser } from "@/lib/auth";
import { apiError, databaseUnavailable, invalidInput, jsonRequest } from "@/lib/api";
import { isSameOrigin } from "@/lib/security";

export const runtime = "nodejs";

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
      slugs.length ? db.select({ id: exercises.id, slug: exercises.slug }).from(exercises).where(and(inArray(exercises.slug, slugs), or(eq(exercises.isSystem, true), eq(exercises.createdBy, user.id)))) : Promise.resolve([]),
      db.select({ id: workoutTemplates.id }).from(workoutTemplates).where(and(eq(workoutTemplates.id, parsed.data.categoryId), or(eq(workoutTemplates.isSystem, true), eq(workoutTemplates.ownerId, user.id)))).limit(1),
    ]);
    const idBySlug = new Map(knownExercises.map((exercise) => [exercise.slug, exercise.id]));
    if (knownExercises.length !== slugs.length) return apiError("One or more exercises are not available.", 422);
    const sessionId = crypto.randomUUID();
    const completedAt = new Date();
    await db.batch([
      db.insert(workoutSessions).values({ id: sessionId, userId: user.id, templateId: template[0]?.id, name: parsed.data.name, startedAt: completedAt, completedAt, durationSeconds: parsed.data.durationSeconds }),
      db.insert(setLogs).values(parsed.data.sets.map((set) => ({ sessionId, exerciseId: idBySlug.get(set.exerciseSlug)!, setNumber: set.setNumber, reps: set.reps, weightKg: String(set.weightKg) }))),
    ]);
    const session = { id: sessionId };
    await db.insert(auditEvents).values({ actorUserId: user.id, action: "workout.completed", targetType: "workout_session", targetId: session.id, metadata: { setCount: parsed.data.sets.length } });
    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    return databaseUnavailable(error);
  }
}
