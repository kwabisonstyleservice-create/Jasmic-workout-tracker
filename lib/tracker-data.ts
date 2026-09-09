import { and, asc, desc, eq, isNotNull } from "drizzle-orm";
import { getDb } from "@/db";
import { bodyMeasurements, exercises, setLogs, trainingPlanDays, trainingPlans, workoutSessions, workoutTemplates } from "@/db/schema";
import { workoutCatalog, type WorkoutCategory } from "@/lib/catalog";
import type { AuthenticatedUser } from "@/lib/auth";
import type { TrackerData } from "@/lib/tracker-types";

function startOfWeek(date: Date) {
  const copy = new Date(date);
  const day = (copy.getUTCDay() + 6) % 7;
  copy.setUTCDate(copy.getUTCDate() - day);
  copy.setUTCHours(0, 0, 0, 0);
  return copy;
}

function weekKey(date: Date) {
  return startOfWeek(date).toISOString().slice(0, 10);
}

function shortWeek(date: Date) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", timeZone: "UTC" }).format(date);
}

export async function getTrackerData(user: AuthenticatedUser): Promise<TrackerData> {
  const db = getDb();
  const [measurementRows, logRows, customExercises, programRows] = await Promise.all([
    db.select().from(bodyMeasurements).where(eq(bodyMeasurements.userId, user.id)).orderBy(asc(bodyMeasurements.measuredAt)).limit(120),
    db
      .select({
        sessionId: workoutSessions.id,
        completedAt: workoutSessions.completedAt,
        exerciseName: exercises.name,
        reps: setLogs.reps,
        weightKg: setLogs.weightKg,
      })
      .from(setLogs)
      .innerJoin(workoutSessions, eq(setLogs.sessionId, workoutSessions.id))
      .innerJoin(exercises, eq(setLogs.exerciseId, exercises.id))
      .where(and(eq(workoutSessions.userId, user.id), isNotNull(workoutSessions.completedAt)))
      .orderBy(desc(workoutSessions.completedAt))
      .limit(4_000),
    db.select().from(exercises).where(and(eq(exercises.createdBy, user.id), eq(exercises.isSystem, false))).orderBy(asc(exercises.name)).limit(200),
    db
      .select({ id: trainingPlanDays.id, dayIndex: trainingPlanDays.dayIndex, title: trainingPlanDays.title, muscleGroup: workoutTemplates.muscleGroup })
      .from(trainingPlanDays)
      .innerJoin(trainingPlans, eq(trainingPlanDays.planId, trainingPlans.id))
      .leftJoin(workoutTemplates, eq(trainingPlanDays.sourceTemplateId, workoutTemplates.id))
      .where(and(eq(trainingPlans.userId, user.id), eq(trainingPlans.isActive, true)))
      .orderBy(asc(trainingPlanDays.dayIndex))
      .limit(21),
  ]);

  const sessionIdsThisMonth = new Set<string>();
  const currentMonth = new Date().toISOString().slice(0, 7);
  const volumeByWeek = new Map<string, number>();
  const bestByExercise = new Map<string, number>();
  let totalVolume = 0;

  for (const row of logRows) {
    const completedAt = row.completedAt;
    if (!completedAt) continue;
    if (completedAt.toISOString().startsWith(currentMonth)) sessionIdsThisMonth.add(row.sessionId);
    const volume = Number(row.weightKg) * row.reps;
    totalVolume += volume;
    const key = weekKey(completedAt);
    volumeByWeek.set(key, (volumeByWeek.get(key) ?? 0) + volume);
    const weight = Number(row.weightKg);
    if (weight > (bestByExercise.get(row.exerciseName) ?? -1)) bestByExercise.set(row.exerciseName, weight);
  }

  const nowWeek = startOfWeek(new Date());
  const volume = Array.from({ length: 8 }, (_, index) => {
    const date = new Date(nowWeek);
    date.setUTCDate(date.getUTCDate() - (7 - index) * 7);
    return { week: shortWeek(date), volume: Math.round(volumeByWeek.get(weekKey(date)) ?? 0) };
  });
  const previousFour = volume.slice(0, 4).reduce((sum, item) => sum + item.volume, 0);
  const latestFour = volume.slice(4).reduce((sum, item) => sum + item.volume, 0);
  const volumeChangePct = previousFour > 0 ? Math.round(((latestFour - previousFour) / previousFour) * 1000) / 10 : 0;

  let weeklyStreak = 0;
  for (let index = 0; index < 52; index += 1) {
    const date = new Date(nowWeek);
    date.setUTCDate(date.getUTCDate() - index * 7);
    if ((volumeByWeek.get(weekKey(date)) ?? 0) > 0) weeklyStreak += 1;
    else if (index > 0 || weeklyStreak === 0) break;
  }

  const measurements = measurementRows.map((row) => ({
    id: row.id,
    measuredAt: row.measuredAt.toISOString().slice(0, 10),
    weightKg: Number(row.weightKg),
    chestCm: Number(row.chestCm),
    waistCm: Number(row.waistCm),
    leftBicepCm: Number(row.leftBicepCm),
    hipsCm: Number(row.hipsCm),
    leftThighCm: Number(row.leftThighCm),
  }));
  const weightChangeKg = measurements.length > 1 ? Math.round((measurements.at(-1)!.weightKg - measurements[0].weightKg) * 10) / 10 : 0;
  const bests = [...bestByExercise.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([exercise, weight]) => ({ exercise, value: `${weight.toFixed(1)} kg`, change: "PB" }));
  while (bests.length < 3) bests.push({ exercise: "Complete a workout", value: "No record yet", change: "NEW" });

  const catalog: WorkoutCategory[] = [...workoutCatalog];
  if (customExercises.length) {
    catalog.push({
      id: "custom",
      title: "Custom",
      accent: "#d8b4fe",
      exercises: customExercises.map((exercise) => ({ slug: exercise.slug, name: exercise.name, equipment: exercise.equipment, sets: exercise.defaultSets, reps: exercise.defaultReps })),
    });
  }

  return {
    user: { id: user.id, displayName: user.displayName, role: user.role },
    stats: {
      workoutsThisMonth: sessionIdsThisMonth.size,
      weeklyStreak,
      volumeKg: Math.round(totalVolume),
      volumeChangePct,
      weightChangeKg,
    },
    volume,
    measurements,
    personalBests: bests,
    programDays: programRows.map((day) => ({ ...day, muscleGroup: day.muscleGroup ?? "Custom" })),
    catalog,
  };
}
