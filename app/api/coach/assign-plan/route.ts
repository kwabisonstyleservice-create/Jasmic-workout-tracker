import { and, asc, eq, inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { auditEvents, trainingPlanDayExercises, trainingPlanDays, trainingPlans, users, workoutTemplateExercises, workoutTemplates } from "@/db/schema";
import { getRequestUser } from "@/lib/auth";
import { apiError, databaseUnavailable, invalidInput, jsonRequest } from "@/lib/api";
import { isSameOrigin } from "@/lib/security";

export const runtime = "nodejs";

const assignmentSchema = z.object({
  targetUserId: z.string().uuid(),
  title: z.string().trim().min(2).max(100),
  days: z.array(z.object({ dayIndex: z.number().int().min(1).max(7), title: z.string().trim().min(2).max(100), categoryId: z.string().min(1).max(80) })).min(1).max(14),
});

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return apiError("Request origin was rejected.", 403);
  if (!jsonRequest(request)) return apiError("Expected JSON.", 415);
  try {
    const coach = await getRequestUser(request);
    if (!coach) return apiError("Sign in required.", 401);
    if (coach.role !== "COACH" && coach.role !== "ADMIN") return apiError("Coach or administrator access is required.", 403);
    const parsed = assignmentSchema.safeParse(await request.json());
    if (!parsed.success) return invalidInput(parsed.error);
    const db = getDb();
    const [targetUser] = await db.select({ id: users.id }).from(users).where(eq(users.id, parsed.data.targetUserId)).limit(1);
    if (!targetUser) return apiError("The selected user was not found.", 404);

    const categoryIds = [...new Set(parsed.data.days.map((day) => day.categoryId))];
    const templates = await db.select({ id: workoutTemplates.id }).from(workoutTemplates).where(inArray(workoutTemplates.id, categoryIds));
    if (templates.length !== categoryIds.length) return apiError("One or more starter routines are unavailable.", 422);

    await db.update(trainingPlans).set({ isActive: false, updatedAt: new Date() }).where(and(eq(trainingPlans.userId, targetUser.id), eq(trainingPlans.isActive, true)));
    const [plan] = await db.insert(trainingPlans).values({ userId: targetUser.id, assignedBy: coach.id, title: parsed.data.title }).returning({ id: trainingPlans.id });

    for (const day of parsed.data.days) {
      const [planDay] = await db.insert(trainingPlanDays).values({ planId: plan.id, dayIndex: day.dayIndex, title: day.title, sourceTemplateId: day.categoryId }).returning({ id: trainingPlanDays.id });
      const items = await db.select().from(workoutTemplateExercises).where(eq(workoutTemplateExercises.templateId, day.categoryId)).orderBy(asc(workoutTemplateExercises.position));
      if (items.length) await db.insert(trainingPlanDayExercises).values(items.map((item) => ({ planDayId: planDay.id, exerciseId: item.exerciseId, position: item.position, targetSets: item.targetSets, targetReps: item.targetReps })));
    }
    await db.insert(auditEvents).values({ actorUserId: coach.id, action: "training_plan.assigned", targetType: "user", targetId: targetUser.id, metadata: { planId: plan.id } });
    return NextResponse.json({ plan }, { status: 201 });
  } catch (error) {
    return databaseUnavailable(error);
  }
}
