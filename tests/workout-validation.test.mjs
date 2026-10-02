import test from 'node:test';
import assert from 'node:assert/strict';
import { routineSchema, workoutSchema } from '../lib/workout-validation.ts';
import { completedSets, initialSets } from '../lib/workout-entries.ts';

test('custom workouts and logging accept more than four or fifty sets', () => {
  const targets = Array.from({ length: 60 }, (_, i) => ({ reps: 12 - i % 8, weightKg: 60 + i }));
  assert.equal(routineSchema.safeParse({ title: 'Push day', exercises: [{ slug: 'bench', setTargets: targets }] }).success, true);
  const sets = targets.map((row, i) => ({ ...row, exerciseSlug: 'bench', setNumber: i + 1 }));
  assert.equal(workoutSchema.safeParse({ categoryId: 'chest', name: 'Push day', sets }).success, true);
});

test('completed sets preserve their row numbers when unfinished rows are skipped', () => {
  const sets = completedSets('bench', [
    { reps: '12', weightKg: '60', completed: true },
    { reps: '10', weightKg: '70', completed: false },
    { reps: '8', weightKg: '75', completed: true },
  ]);
  assert.deepEqual(sets.map((set) => set.setNumber), [1, 3]);
  assert.deepEqual(sets.map((set) => set.reps), [12, 8]);
});

test('session editing does not mutate saved targets', () => {
  const exercise = { slug: 'bench', sets: 2, reps: 'Per set', name: 'Bench', equipment: 'Barbell', setTargets: [{ reps: 12, weightKg: 60 }, { reps: 8, weightKg: 70 }] };
  const rows = initialSets(exercise);
  rows[0].reps = '20'; rows.pop();
  assert.equal(exercise.setTargets[0].reps, 12);
  assert.equal(exercise.setTargets.length, 2);
});

test('invalid and ambiguous input is rejected', () => {
  const item = { slug: 'bench', setTargets: [{ reps: 12, weightKg: 60 }] };
  assert.equal(routineSchema.safeParse({ title: 'Push day', exercises: [item, item] }).success, false);
  assert.equal(routineSchema.safeParse({ title: 'Push day', exercises: [] }).success, false);
  assert.equal(routineSchema.safeParse({ title: 'Push day', exercises: [{ ...item, setTargets: [{ reps: 2.5, weightKg: -1 }] }] }).success, false);
  const base = { categoryId: 'chest', name: 'Push day' };
  const row = { exerciseSlug: 'bench', setNumber: 1, reps: 12, weightKg: 60 };
  assert.equal(workoutSchema.safeParse({ ...base, sets: [] }).success, false);
  assert.equal(workoutSchema.safeParse({ ...base, sets: [row, row] }).success, false);
  assert.equal(workoutSchema.safeParse({ ...base, sets: completedSets('bench', [{ reps: '', weightKg: '', completed: true }]) }).success, false);
});
