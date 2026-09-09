CREATE TABLE "audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_user_id" uuid,
	"action" varchar(80) NOT NULL,
	"target_type" varchar(50) NOT NULL,
	"target_id" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_rate_limits" (
	"key" varchar(64) PRIMARY KEY NOT NULL,
	"count" integer DEFAULT 1 NOT NULL,
	"reset_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_sessions" (
	"token_hash" varchar(64) PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "body_measurements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"measured_at" timestamp with time zone NOT NULL,
	"weight_kg" numeric(6, 2) NOT NULL,
	"neck_cm" numeric(5, 1),
	"shoulders_cm" numeric(5, 1),
	"chest_cm" numeric(5, 1) NOT NULL,
	"waist_cm" numeric(5, 1) NOT NULL,
	"hips_cm" numeric(5, 1) NOT NULL,
	"left_bicep_cm" numeric(5, 1) NOT NULL,
	"right_bicep_cm" numeric(5, 1),
	"left_thigh_cm" numeric(5, 1) NOT NULL,
	"right_thigh_cm" numeric(5, 1),
	"left_calf_cm" numeric(5, 1),
	"right_calf_cm" numeric(5, 1),
	"body_fat_pct" numeric(4, 1),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exercises" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" varchar(120) NOT NULL,
	"name" varchar(120) NOT NULL,
	"muscle_group" varchar(40) NOT NULL,
	"equipment" varchar(80) NOT NULL,
	"instructions" text,
	"default_sets" integer DEFAULT 3 NOT NULL,
	"default_reps" varchar(30) DEFAULT '8–12' NOT NULL,
	"is_system" boolean DEFAULT false NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"birth_year" integer,
	"height_cm" numeric(5, 1),
	"training_goal" varchar(40) DEFAULT 'general_fitness' NOT NULL,
	"experience_level" varchar(20) DEFAULT 'beginner' NOT NULL,
	"weight_unit" varchar(4) DEFAULT 'kg' NOT NULL,
	"length_unit" varchar(4) DEFAULT 'cm' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "set_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"exercise_id" text NOT NULL,
	"set_number" integer NOT NULL,
	"reps" integer NOT NULL,
	"weight_kg" numeric(7, 2) DEFAULT '0' NOT NULL,
	"rpe" numeric(3, 1),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "training_plan_day_exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_day_id" uuid NOT NULL,
	"exercise_id" text NOT NULL,
	"position" integer NOT NULL,
	"target_sets" integer NOT NULL,
	"target_reps" varchar(30) NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "training_plan_days" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_id" uuid NOT NULL,
	"day_index" integer NOT NULL,
	"title" varchar(100) NOT NULL,
	"source_template_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "training_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"assigned_by" uuid,
	"title" varchar(100) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(320) NOT NULL,
	"password_hash" text NOT NULL,
	"display_name" varchar(100) NOT NULL,
	"role" varchar(12) DEFAULT 'USER' NOT NULL,
	"email_verified_at" timestamp with time zone,
	"terms_accepted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workout_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"plan_day_id" uuid,
	"template_id" text,
	"name" varchar(100) NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"duration_seconds" integer,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "workout_template_exercises" (
	"template_id" text NOT NULL,
	"exercise_id" text NOT NULL,
	"position" integer NOT NULL,
	"target_sets" integer NOT NULL,
	"target_reps" varchar(30) NOT NULL,
	"rest_seconds" integer DEFAULT 90 NOT NULL,
	CONSTRAINT "workout_template_exercises_template_id_exercise_id_pk" PRIMARY KEY("template_id","exercise_id")
);
--> statement-breakpoint
CREATE TABLE "workout_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" uuid,
	"title" varchar(100) NOT NULL,
	"muscle_group" varchar(40) NOT NULL,
	"description" text,
	"is_system" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "body_measurements" ADD CONSTRAINT "body_measurements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "set_logs" ADD CONSTRAINT "set_logs_session_id_workout_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."workout_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "set_logs" ADD CONSTRAINT "set_logs_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_plan_day_exercises" ADD CONSTRAINT "training_plan_day_exercises_plan_day_id_training_plan_days_id_fk" FOREIGN KEY ("plan_day_id") REFERENCES "public"."training_plan_days"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_plan_day_exercises" ADD CONSTRAINT "training_plan_day_exercises_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_plan_days" ADD CONSTRAINT "training_plan_days_plan_id_training_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."training_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_plan_days" ADD CONSTRAINT "training_plan_days_source_template_id_workout_templates_id_fk" FOREIGN KEY ("source_template_id") REFERENCES "public"."workout_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_plans" ADD CONSTRAINT "training_plans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_plans" ADD CONSTRAINT "training_plans_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_plan_day_id_training_plan_days_id_fk" FOREIGN KEY ("plan_day_id") REFERENCES "public"."training_plan_days"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_template_id_workout_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."workout_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_template_exercises" ADD CONSTRAINT "workout_template_exercises_template_id_workout_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."workout_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_template_exercises" ADD CONSTRAINT "workout_template_exercises_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_templates" ADD CONSTRAINT "workout_templates_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_events_actor_date_idx" ON "audit_events" USING btree ("actor_user_id","created_at");--> statement-breakpoint
CREATE INDEX "auth_sessions_user_id_idx" ON "auth_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "auth_sessions_expires_at_idx" ON "auth_sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "body_measurements_user_date_unique" ON "body_measurements" USING btree ("user_id","measured_at");--> statement-breakpoint
CREATE INDEX "body_measurements_user_date_idx" ON "body_measurements" USING btree ("user_id","measured_at");--> statement-breakpoint
CREATE UNIQUE INDEX "exercises_slug_unique" ON "exercises" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "exercises_created_by_idx" ON "exercises" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "exercises_muscle_group_idx" ON "exercises" USING btree ("muscle_group");--> statement-breakpoint
CREATE INDEX "set_logs_session_idx" ON "set_logs" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "set_logs_exercise_idx" ON "set_logs" USING btree ("exercise_id");--> statement-breakpoint
CREATE INDEX "training_plan_day_exercises_position_idx" ON "training_plan_day_exercises" USING btree ("plan_day_id","position");--> statement-breakpoint
CREATE INDEX "training_plan_days_plan_day_idx" ON "training_plan_days" USING btree ("plan_id","day_index");--> statement-breakpoint
CREATE INDEX "training_plans_user_active_idx" ON "training_plans" USING btree ("user_id","is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "workout_sessions_user_completed_idx" ON "workout_sessions" USING btree ("user_id","completed_at");--> statement-breakpoint
CREATE INDEX "workout_template_exercises_position_idx" ON "workout_template_exercises" USING btree ("template_id","position");--> statement-breakpoint
CREATE INDEX "workout_templates_owner_idx" ON "workout_templates" USING btree ("owner_id");