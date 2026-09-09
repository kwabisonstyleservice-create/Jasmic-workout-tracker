import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("Set DATABASE_URL before running npm run db:seed.");

const catalog = JSON.parse(await readFile(new URL("../data/workouts.json", import.meta.url), "utf8"));
const sql = neon(databaseUrl);
let exerciseCount = 0;

for (const category of catalog) {
  await sql.query(
    `insert into workout_templates (id, title, muscle_group, description, is_system)
     values ($1, $2, $3, $4, true)
     on conflict (id) do update set title = excluded.title, muscle_group = excluded.muscle_group, description = excluded.description, is_system = true, updated_at = now()`,
    [category.id, `${category.title} workout`, category.title, "Starter routine transcribed from the supplied JASMIC reference material."],
  );

  for (const [position, exercise] of category.exercises.entries()) {
    await sql.query(
      `insert into exercises (id, slug, name, muscle_group, equipment, default_sets, default_reps, is_system)
       values ($1, $2, $3, $4, $5, $6, $7, true)
       on conflict (id) do update set name = excluded.name, muscle_group = excluded.muscle_group, equipment = excluded.equipment, default_sets = excluded.default_sets, default_reps = excluded.default_reps, is_system = true`,
      [exercise.slug, exercise.slug, exercise.name, category.title, exercise.equipment, exercise.sets, exercise.reps],
    );
    await sql.query(
      `insert into workout_template_exercises (template_id, exercise_id, position, target_sets, target_reps, rest_seconds)
       values ($1, $2, $3, $4, $5, $6)
       on conflict (template_id, exercise_id) do update set position = excluded.position, target_sets = excluded.target_sets, target_reps = excluded.target_reps, rest_seconds = excluded.rest_seconds`,
      [category.id, exercise.slug, position + 1, exercise.sets, exercise.reps, 90],
    );
    exerciseCount += 1;
  }
}

console.log(`Seeded ${catalog.length} workout templates and ${exerciseCount} exercises.`);
