import type { CatalogExercise } from "@/lib/catalog";

export type SetRow = { reps: string; weightKg: string; completed?: boolean };

export function completedSets(exerciseSlug: string, rows: SetRow[]) {
  return rows.flatMap((row, index) => row.completed ? [{
    exerciseSlug,
    setNumber: index + 1,
    reps: row.reps === "" ? NaN : Number(row.reps),
    weightKg: row.weightKg === "" ? 0 : Number(row.weightKg),
  }] : []);
}

export function initialSets(exercise: CatalogExercise): SetRow[] {
  return exercise.setTargets?.map((set) => ({ reps: String(set.reps), weightKg: String(set.weightKg) })) ?? Array.from({ length: exercise.sets }, () => ({ reps: String(Number.parseInt(exercise.reps) || 10), weightKg: "0" }));
}
