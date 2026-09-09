import type { WorkoutCategory } from "@/lib/catalog";

export type MeasurementPoint = {
  id: string;
  measuredAt: string;
  weightKg: number;
  chestCm: number;
  waistCm: number;
  leftBicepCm: number;
  hipsCm: number;
  leftThighCm: number;
};

export type VolumePoint = {
  week: string;
  volume: number;
};

export type PersonalBest = {
  exercise: string;
  value: string;
  change: string;
};

export type ProgramDay = {
  id: string;
  dayIndex: number;
  title: string;
  muscleGroup: string;
};

export type TrackerData = {
  user: {
    id: string;
    displayName: string;
    role: "USER" | "COACH" | "ADMIN";
  };
  stats: {
    workoutsThisMonth: number;
    weeklyStreak: number;
    volumeKg: number;
    volumeChangePct: number;
    weightChangeKg: number;
  };
  volume: VolumePoint[];
  measurements: MeasurementPoint[];
  personalBests: PersonalBest[];
  programDays: ProgramDay[];
  catalog: WorkoutCategory[];
};
