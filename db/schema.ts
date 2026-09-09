import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 320 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    displayName: varchar("display_name", { length: 100 }).notNull(),
    role: varchar("role", { length: 12 }).notNull().default("USER"),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    termsAcceptedAt: timestamp("terms_accepted_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("users_email_unique").on(table.email)],
);

export const profiles = pgTable("profiles", {
  userId: uuid("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  birthYear: integer("birth_year"),
  heightCm: numeric("height_cm", { precision: 5, scale: 1 }),
  trainingGoal: varchar("training_goal", { length: 40 }).notNull().default("general_fitness"),
  experienceLevel: varchar("experience_level", { length: 20 }).notNull().default("beginner"),
  weightUnit: varchar("weight_unit", { length: 4 }).notNull().default("kg"),
  lengthUnit: varchar("length_unit", { length: 4 }).notNull().default("cm"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const authSessions = pgTable(
  "auth_sessions",
  {
    tokenHash: varchar("token_hash", { length: 64 }).primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("auth_sessions_user_id_idx").on(table.userId), index("auth_sessions_expires_at_idx").on(table.expiresAt)],
);

export const authRateLimits = pgTable("auth_rate_limits", {
  key: varchar("key", { length: 64 }).primaryKey(),
  count: integer("count").notNull().default(1),
  resetAt: timestamp("reset_at", { withTimezone: true }).notNull(),
});

export const exercises = pgTable(
  "exercises",
  {
    id: text("id").primaryKey(),
    slug: varchar("slug", { length: 120 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    muscleGroup: varchar("muscle_group", { length: 40 }).notNull(),
    equipment: varchar("equipment", { length: 80 }).notNull(),
    instructions: text("instructions"),
    defaultSets: integer("default_sets").notNull().default(3),
    defaultReps: varchar("default_reps", { length: 30 }).notNull().default("8–12"),
    isSystem: boolean("is_system").notNull().default(false),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("exercises_slug_unique").on(table.slug), index("exercises_created_by_idx").on(table.createdBy), index("exercises_muscle_group_idx").on(table.muscleGroup)],
);

export const workoutTemplates = pgTable(
  "workout_templates",
  {
    id: text("id").primaryKey(),
    ownerId: uuid("owner_id").references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 100 }).notNull(),
    muscleGroup: varchar("muscle_group", { length: 40 }).notNull(),
    description: text("description"),
    isSystem: boolean("is_system").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("workout_templates_owner_idx").on(table.ownerId)],
);

export const workoutTemplateExercises = pgTable(
  "workout_template_exercises",
  {
    templateId: text("template_id").notNull().references(() => workoutTemplates.id, { onDelete: "cascade" }),
    exerciseId: text("exercise_id").notNull().references(() => exercises.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    targetSets: integer("target_sets").notNull(),
    targetReps: varchar("target_reps", { length: 30 }).notNull(),
    restSeconds: integer("rest_seconds").notNull().default(90),
  },
  (table) => [primaryKey({ columns: [table.templateId, table.exerciseId] }), index("workout_template_exercises_position_idx").on(table.templateId, table.position)],
);

export const trainingPlans = pgTable(
  "training_plans",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    assignedBy: uuid("assigned_by").references(() => users.id, { onDelete: "set null" }),
    title: varchar("title", { length: 100 }).notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("training_plans_user_active_idx").on(table.userId, table.isActive)],
);

export const trainingPlanDays = pgTable(
  "training_plan_days",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    planId: uuid("plan_id").notNull().references(() => trainingPlans.id, { onDelete: "cascade" }),
    dayIndex: integer("day_index").notNull(),
    title: varchar("title", { length: 100 }).notNull(),
    sourceTemplateId: text("source_template_id").references(() => workoutTemplates.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("training_plan_days_plan_day_idx").on(table.planId, table.dayIndex)],
);

export const trainingPlanDayExercises = pgTable(
  "training_plan_day_exercises",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    planDayId: uuid("plan_day_id").notNull().references(() => trainingPlanDays.id, { onDelete: "cascade" }),
    exerciseId: text("exercise_id").notNull().references(() => exercises.id, { onDelete: "restrict" }),
    position: integer("position").notNull(),
    targetSets: integer("target_sets").notNull(),
    targetReps: varchar("target_reps", { length: 30 }).notNull(),
    notes: text("notes"),
  },
  (table) => [index("training_plan_day_exercises_position_idx").on(table.planDayId, table.position)],
);

export const workoutSessions = pgTable(
  "workout_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    planDayId: uuid("plan_day_id").references(() => trainingPlanDays.id, { onDelete: "set null" }),
    templateId: text("template_id").references(() => workoutTemplates.id, { onDelete: "set null" }),
    name: varchar("name", { length: 100 }).notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    durationSeconds: integer("duration_seconds"),
    notes: text("notes"),
  },
  (table) => [index("workout_sessions_user_completed_idx").on(table.userId, table.completedAt)],
);

export const setLogs = pgTable(
  "set_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sessionId: uuid("session_id").notNull().references(() => workoutSessions.id, { onDelete: "cascade" }),
    exerciseId: text("exercise_id").notNull().references(() => exercises.id, { onDelete: "restrict" }),
    setNumber: integer("set_number").notNull(),
    reps: integer("reps").notNull(),
    weightKg: numeric("weight_kg", { precision: 7, scale: 2 }).notNull().default("0"),
    rpe: numeric("rpe", { precision: 3, scale: 1 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("set_logs_session_idx").on(table.sessionId), index("set_logs_exercise_idx").on(table.exerciseId)],
);

export const bodyMeasurements = pgTable(
  "body_measurements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    measuredAt: timestamp("measured_at", { withTimezone: true }).notNull(),
    weightKg: numeric("weight_kg", { precision: 6, scale: 2 }).notNull(),
    neckCm: numeric("neck_cm", { precision: 5, scale: 1 }),
    shouldersCm: numeric("shoulders_cm", { precision: 5, scale: 1 }),
    chestCm: numeric("chest_cm", { precision: 5, scale: 1 }).notNull(),
    waistCm: numeric("waist_cm", { precision: 5, scale: 1 }).notNull(),
    hipsCm: numeric("hips_cm", { precision: 5, scale: 1 }).notNull(),
    leftBicepCm: numeric("left_bicep_cm", { precision: 5, scale: 1 }).notNull(),
    rightBicepCm: numeric("right_bicep_cm", { precision: 5, scale: 1 }),
    leftThighCm: numeric("left_thigh_cm", { precision: 5, scale: 1 }).notNull(),
    rightThighCm: numeric("right_thigh_cm", { precision: 5, scale: 1 }),
    leftCalfCm: numeric("left_calf_cm", { precision: 5, scale: 1 }),
    rightCalfCm: numeric("right_calf_cm", { precision: 5, scale: 1 }),
    bodyFatPct: numeric("body_fat_pct", { precision: 4, scale: 1 }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("body_measurements_user_date_unique").on(table.userId, table.measuredAt), index("body_measurements_user_date_idx").on(table.userId, table.measuredAt)],
);

export const auditEvents = pgTable(
  "audit_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    actorUserId: uuid("actor_user_id").references(() => users.id, { onDelete: "set null" }),
    action: varchar("action", { length: 80 }).notNull(),
    targetType: varchar("target_type", { length: 50 }).notNull(),
    targetId: text("target_id"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("audit_events_actor_date_idx").on(table.actorUserId, table.createdAt)],
);
