import { and, asc, eq, gte, lte } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { auditEvents, bodyMeasurements } from "@/db/schema";
import { getRequestUser } from "@/lib/auth";
import { apiError, databaseUnavailable, invalidInput, jsonRequest } from "@/lib/api";
import { isSameOrigin } from "@/lib/security";

export const runtime = "nodejs";

const measurementSchema = z.object({
  measuredAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  weightKg: z.number().positive().max(500),
  neckCm: z.number().positive().max(150).optional(),
  shouldersCm: z.number().positive().max(300).optional(),
  chestCm: z.number().positive().max(300),
  waistCm: z.number().positive().max(300),
  leftBicepCm: z.number().positive().max(150),
  rightBicepCm: z.number().positive().max(150).optional(),
  hipsCm: z.number().positive().max(300),
  leftThighCm: z.number().positive().max(200),
  rightThighCm: z.number().positive().max(200).optional(),
  leftCalfCm: z.number().positive().max(150).optional(),
  rightCalfCm: z.number().positive().max(150).optional(),
  bodyFatPct: z.number().positive().max(80).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await getRequestUser(request);
    if (!user) return apiError("Sign in required.", 401);
    const rows = await getDb().select().from(bodyMeasurements).where(eq(bodyMeasurements.userId, user.id)).orderBy(asc(bodyMeasurements.measuredAt)).limit(100);
    return NextResponse.json({ measurements: rows });
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
    const parsed = measurementSchema.safeParse(await request.json());
    if (!parsed.success) return invalidInput(parsed.error);
    const dayStart = new Date(`${parsed.data.measuredAt}T00:00:00.000Z`);
    const dayEnd = new Date(`${parsed.data.measuredAt}T23:59:59.999Z`);
    const db = getDb();
    await db.delete(bodyMeasurements).where(and(eq(bodyMeasurements.userId, user.id), gte(bodyMeasurements.measuredAt, dayStart), lte(bodyMeasurements.measuredAt, dayEnd)));
    const [measurement] = await db.insert(bodyMeasurements).values({
      userId: user.id,
      measuredAt: new Date(`${parsed.data.measuredAt}T12:00:00.000Z`),
      weightKg: String(parsed.data.weightKg),
      neckCm: parsed.data.neckCm ? String(parsed.data.neckCm) : undefined,
      shouldersCm: parsed.data.shouldersCm ? String(parsed.data.shouldersCm) : undefined,
      chestCm: String(parsed.data.chestCm),
      waistCm: String(parsed.data.waistCm),
      leftBicepCm: String(parsed.data.leftBicepCm),
      rightBicepCm: parsed.data.rightBicepCm ? String(parsed.data.rightBicepCm) : undefined,
      hipsCm: String(parsed.data.hipsCm),
      leftThighCm: String(parsed.data.leftThighCm),
      rightThighCm: parsed.data.rightThighCm ? String(parsed.data.rightThighCm) : undefined,
      leftCalfCm: parsed.data.leftCalfCm ? String(parsed.data.leftCalfCm) : undefined,
      rightCalfCm: parsed.data.rightCalfCm ? String(parsed.data.rightCalfCm) : undefined,
      bodyFatPct: parsed.data.bodyFatPct ? String(parsed.data.bodyFatPct) : undefined,
    }).returning({ id: bodyMeasurements.id, measuredAt: bodyMeasurements.measuredAt });
    await db.insert(auditEvents).values({ actorUserId: user.id, action: "measurement.created", targetType: "body_measurement", targetId: measurement.id });
    return NextResponse.json({ measurement }, { status: 201 });
  } catch (error) {
    return databaseUnavailable(error);
  }
}
