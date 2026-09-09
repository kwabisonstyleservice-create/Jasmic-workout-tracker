import { and, asc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { auditEvents, trainingPlanDayExercises, trainingPlanDays, trainingPlans, workoutTemplateExercises, workoutTemplates } from "@/db/schema";
import { getRequestUser } from "@/lib/auth";
import { apiError, databaseUnavailable, invalidInput, jsonRequest } from "@/lib/api";
import { isSameOrigin } from "@/lib/security";

export const runtime = "nodejs";

const planDaySchema = z.object({
  title: z.string().trim().min(2).max(80),
  dayIndex: z.number().int().min(1).max(7),
  categoryId: z.string().min(1).max(80),
});

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return apiError("Request origin was rejected.", 403);
  if (!jsonRequest(request)) return apiError("Expected JSON.", 415);
  try {
    const user = await getRequestUser(request);
    if (!user) return apiError("Sign in required.", 401);
    const parsed = planDaySchema.safeParse(await request.json());
    if (!parsed.success) return invalidInput(parsed.error);
    const db = getDb();
    let [plan] = await db.select({ id: trainingPlans.id }).from(trainingPlans).where(and(eq(trainingPlans.userId, user.id), eq(trainingPlans.isActive, true))).limit(1);
    if (!plan) [plan] = await db.insert(trainingPlans).values({ userId: user.id, title: "My training plan" }).returning({ id: trainingPlans.id });
    const [template] = await db.select({ id: workoutTemplates.id }).from(workoutTemplates).where(eq(workoutTemplates.id, parsed.data.categoryId)).limit(1);
    const [planDay] = await db.insert(trainingPlanDays).values({ planId: plan.id, dayIndex: parsed.data.dayIndex, title: parsed.data.title, sourceTemplateId: template?.id }).returning({ id: trainingPlanDays.id });
    const templateExercises = await db.select().from(workoutTemplateExercises).where(eq(workoutTemplateExercises.templateId, parsed.data.categoryId)).orderBy(asc(workoutTemplateExercises.position));
    if (templateExercises.length) await db.insert(trainingPlanDayExercises).values(templateExercises.map((item) => ({ planDayId: planDay.id, exerciseId: item.exerciseId, position: item.position, targetSets: item.targetSets, targetReps: item.targetReps })));
    await db.insert(auditEvents).values({ actorUserId: user.id, action: "plan_day.created", targetType: "training_plan_day", targetId: planDay.id });
    return NextResponse.json({ planId: plan.id, planDay }, { status: 201 });
  } catch (error) {
    return databaseUnavailable(error);
  }
}
