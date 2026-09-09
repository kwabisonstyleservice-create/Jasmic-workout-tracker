import catalogJson from "@/data/workouts.json";

export type CatalogExercise = {
  slug: string;
  name: string;
  equipment: string;
  sets: number;
  reps: string;
  note?: string;
};

export type WorkoutCategory = {
  id: string;
  title: string;
  accent: string;
  exercises: CatalogExercise[];
};

export const workoutCatalog = catalogJson as WorkoutCategory[];

export const exerciseCount = workoutCatalog.reduce(
  (total, category) => total + category.exercises.length,
  0,
);

export function getCategory(categoryId: string) {
  return workoutCatalog.find((category) => category.id === categoryId);
}

