import { workoutCatalog } from "@/lib/catalog";
import type { TrackerData } from "@/lib/tracker-types";

export const demoTrackerData: TrackerData = {
  user: {
    id: "demo-user",
    displayName: "Michael",
    role: "USER",
  },
  stats: {
    workoutsThisMonth: 12,
    weeklyStreak: 4,
    volumeKg: 18640,
    volumeChangePct: 8.4,
    weightChangeKg: -2.8,
  },
  volume: [
    { week: "05 Aug", volume: 11200 },
    { week: "12 Aug", volume: 12850 },
    { week: "19 Aug", volume: 14100 },
    { week: "26 Aug", volume: 13900 },
    { week: "02 Sep", volume: 17190 },
    { week: "09 Sep", volume: 18640 },
  ],
  measurements: [
    { id: "m1", measuredAt: "2026-07-01", weightKg: 135, chestCm: 124, waistCm: 127, leftBicepCm: 42, hipsCm: 121, leftThighCm: 69 },
    { id: "m2", measuredAt: "2026-07-22", weightKg: 133.9, chestCm: 123.5, waistCm: 124.5, leftBicepCm: 42.3, hipsCm: 119.8, leftThighCm: 69.2 },
    { id: "m3", measuredAt: "2026-08-12", weightKg: 132.8, chestCm: 123, waistCm: 122.5, leftBicepCm: 42.8, hipsCm: 118.9, leftThighCm: 69.5 },
    { id: "m4", measuredAt: "2026-09-02", weightKg: 132.2, chestCm: 122.8, waistCm: 120.8, leftBicepCm: 43.1, hipsCm: 118.2, leftThighCm: 69.8 },
  ],
  personalBests: [
    { exercise: "Barbell bench press", value: "92.5 kg × 8", change: "+5 kg" },
    { exercise: "Barbell squat", value: "120 kg × 8", change: "+10 kg" },
    { exercise: "Lat pulldown", value: "82 kg × 10", change: "+6 kg" },
  ],
  programDays: [
    { id: "demo-mon", dayIndex: 1, title: "Chest + triceps", muscleGroup: "Chest" },
    { id: "demo-tue", dayIndex: 2, title: "Back + biceps", muscleGroup: "Back" },
    { id: "demo-wed", dayIndex: 3, title: "Recovery", muscleGroup: "Mobility" },
    { id: "demo-thu", dayIndex: 4, title: "Leg strength", muscleGroup: "Legs" },
    { id: "demo-fri", dayIndex: 5, title: "Shoulders + arms", muscleGroup: "Shoulders" },
    { id: "demo-sat", dayIndex: 6, title: "Optional full body", muscleGroup: "Custom" }
  ],
  catalog: workoutCatalog,
};
