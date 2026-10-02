import { z } from "zod";

export const setTargetSchema = z.object({
  reps: z.number().int().min(0).max(500),
  weightKg: z.number().finite().min(0).max(2000),
});
export const routineSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(2).max(80),
  exercises: z.array(z.object({
    slug: z.string().min(1).max(120),
    setTargets: z.array(setTargetSchema).min(1),
  })).min(1).refine((items) => new Set(items.map((item) => item.slug)).size === items.length, "Choose each exercise only once."),
});
export const workoutSchema = z.object({
  categoryId: z.string().min(1).max(80),
  name: z.string().trim().min(2).max(100),
  durationSeconds: z.number().int().min(0).max(86400).optional(),
  sets: z.array(setTargetSchema.extend({
    exerciseSlug: z.string().min(1).max(120),
    setNumber: z.number().int().min(1).max(2147483647),
  })).min(1).refine((items) => new Set(items.map((item) => `${item.exerciseSlug}:${item.setNumber}`)).size === items.length, "Set numbers must be unique per exercise."),
});
