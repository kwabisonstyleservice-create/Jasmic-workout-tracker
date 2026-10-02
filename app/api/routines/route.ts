import { and, eq, inArray, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { exercises, workoutTemplates, workoutTemplateExercises } from "@/db/schema";
import { getRequestUser } from "@/lib/auth";
import { apiError, databaseUnavailable, invalidInput, jsonRequest } from "@/lib/api";
import { isSameOrigin } from "@/lib/security";
import { routineSchema } from "@/lib/workout-validation";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return apiError("Request origin was rejected.", 403);
  if (!jsonRequest(request)) return apiError("Expected JSON.", 415);
  try {
    const user = await getRequestUser(request);
    if (!user) return apiError("Sign in required.", 401);
    const parsed = routineSchema.safeParse(await request.json());
    if (!parsed.success) return invalidInput(parsed.error);
    const db = getDb();
    const id = parsed.data.id ?? crypto.randomUUID();
    const ownTemplate = and(eq(workoutTemplates.id, id), eq(workoutTemplates.ownerId, user.id), eq(workoutTemplates.isSystem, false));
    if (parsed.data.id) {
      const [existing] = await db.select({ id: workoutTemplates.id }).from(workoutTemplates).where(ownTemplate).limit(1);
      if (!existing) return apiError("Workout was not found.", 404);
    }
    const available = await db.select().from(exercises).where(and(
      inArray(exercises.slug, parsed.data.exercises.map((item) => item.slug)),
      or(eq(exercises.isSystem, true), eq(exercises.createdBy, user.id)),
    ));
    if (available.length !== parsed.data.exercises.length) return apiError("One or more exercises are not available.", 422);
    const bySlug = new Map(available.map((exercise) => [exercise.slug, exercise]));
    const values = parsed.data.exercises.map((item, position) => ({
      templateId: id, exerciseId: bySlug.get(item.slug)!.id, position,
      targetSets: item.setTargets.length, targetReps: "Per set", setTargets: item.setTargets,
    }));
    // Neon HTTP batch executes all statements in one transaction.
    if (parsed.data.id) {
      await db.batch([
        db.update(workoutTemplates).set({ title: parsed.data.title, updatedAt: new Date() }).where(ownTemplate),
        db.delete(workoutTemplateExercises).where(eq(workoutTemplateExercises.templateId, id)),
        db.insert(workoutTemplateExercises).values(values),
      ]);
    } else {
      await db.batch([
        db.insert(workoutTemplates).values({ id, ownerId: user.id, title: parsed.data.title, muscleGroup: "Custom" }),
        db.insert(workoutTemplateExercises).values(values),
      ]);
    }
    const routine = { id, title: parsed.data.title, accent: "#c7ff4a", exercises: parsed.data.exercises.map((item) => {
      const exercise = bySlug.get(item.slug)!;
      return { slug: exercise.slug, name: exercise.name, equipment: exercise.equipment, sets: item.setTargets.length, reps: "Per set", setTargets: item.setTargets };
    }) };
    return NextResponse.json({ routine }, { status: parsed.data.id ? 200 : 201 });
  } catch (error) { return databaseUnavailable(error); }
}
