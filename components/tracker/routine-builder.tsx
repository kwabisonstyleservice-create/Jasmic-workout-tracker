"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { WorkoutCategory } from "@/lib/catalog";
import { routineSchema, MAX_SETS_PER_EXERCISE, MAX_ROUTINE_EXERCISES } from "@/lib/workout-validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { initialSets, type SetRow } from "@/lib/workout-entries";

export function SetEditor({ name, rows, onChange, live = false }: { name: string; rows: SetRow[]; onChange: (rows: SetRow[]) => void; live?: boolean }) {
  function update(index: number, field: "reps" | "weightKg" | "completed", value: string | boolean) {
    onChange(rows.map((row, rowIndex) => rowIndex === index ? { ...row, [field]: value } : row));
  }
  return <div className="mt-4 space-y-2">
    <div className={`grid ${live ? "grid-cols-[2rem_1fr_1fr_2rem_2rem]" : "grid-cols-[2rem_1fr_1fr_2rem]"} gap-2 text-center text-sm text-zinc-400`}><span>Set</span><span>kg</span><span>Reps</span>{live && <span>Done</span>}<span /></div>
    {rows.map((row, index) => <div key={index} className={`grid ${live ? "grid-cols-[2rem_1fr_1fr_2rem_2rem]" : "grid-cols-[2rem_1fr_1fr_2rem]"} items-center gap-2`}>
      <span className="text-center text-sm">{index + 1}</span>
      <Input type="number" inputMode="decimal" min="0" max="2000" step="0.01" aria-label={`${name} set ${index + 1} weight in kilograms`} value={row.weightKg} onChange={(event) => update(index, "weightKg", event.target.value)} className="min-w-0 border-white/10 bg-zinc-900 text-center" />
      <Input type="number" inputMode="numeric" min="0" max="500" step="1" aria-label={`${name} set ${index + 1} repetitions`} value={row.reps} onChange={(event) => update(index, "reps", event.target.value)} className="min-w-0 border-white/10 bg-zinc-900 text-center" />
      {live && <input type="checkbox" className="size-5 accent-lime-300" aria-label={`${name} set ${index + 1} completed`} checked={Boolean(row.completed)} onChange={(event) => update(index, "completed", event.target.checked)} />}
      <button type="button" className="h-10 text-zinc-400 hover:text-white disabled:opacity-30" disabled={rows.length <= 1} aria-label={`Remove ${name} set ${index + 1}`} onClick={() => onChange(rows.filter((_, rowIndex) => rowIndex !== index))}>×</button>
    </div>)}
    <Button type="button" variant="outline" className="mt-2 border-white/10 bg-transparent text-white" disabled={rows.length >= MAX_SETS_PER_EXERCISE} onClick={() => onChange([...rows, { reps: live ? "" : rows.at(-1)?.reps ?? "10", weightKg: live ? "" : rows.at(-1)?.weightKg ?? "0", completed: false }])}>+ Add set</Button>
  </div>;
}

export function RoutineBuilder({ catalog, routine, isDemo, onClose, onSaved }: { catalog: WorkoutCategory[]; routine?: WorkoutCategory; isDemo: boolean; onClose: () => void; onSaved: (routine: WorkoutCategory) => void }) {
  const [title, setTitle] = useState(routine?.title ?? "");
  const [items, setItems] = useState(() => routine?.exercises.map((exercise) => ({ exercise, rows: initialSets(exercise) })) ?? []);
  const [selection, setSelection] = useState("");
  const [saving, setSaving] = useState(false);
  const available = catalog.flatMap((category) => category.exercises).filter((exercise) => !items.some((item) => item.exercise.slug === exercise.slug));
  function move(index: number, offset: number) {
    setItems((current) => { const next = [...current]; [next[index], next[index + offset]] = [next[index + offset], next[index]]; return next; });
  }
  async function save() {
    const payload = { id: routine?.id, title, exercises: items.map((item) => ({ slug: item.exercise.slug, setTargets: item.rows.map((row) => ({ reps: row.reps === "" ? NaN : Number(row.reps), weightKg: row.weightKg === "" ? NaN : Number(row.weightKg) })) })) };
    const parsed = routineSchema.safeParse(payload);
    if (!parsed.success) { toast.error("Add a workout name, at least one exercise, and valid reps and weight for every set."); return; }
    setSaving(true);
    try {
      let saved: WorkoutCategory = { id: routine?.id ?? crypto.randomUUID(), title: parsed.data.title, accent: "#c7ff4a", exercises: items.map((item, index) => ({ ...item.exercise, sets: item.rows.length, reps: "Per set", setTargets: parsed.data.exercises[index].setTargets })) };
      if (!isDemo) {
        const response = await fetch("/api/routines", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(parsed.data) });
        if (!response.ok) throw new Error("Workout could not be saved. Please try again.");
        saved = (await response.json()).routine;
      }
      onSaved(saved); toast.success(isDemo ? "Preview workout saved" : "Custom workout saved"); onClose();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Workout could not be saved."); }
    finally { setSaving(false); }
  }
  return <Dialog open onOpenChange={(open) => !open && !saving && onClose()}><DialogContent className="max-h-[92vh] overflow-y-auto border-white/10 bg-zinc-950 text-white sm:max-w-3xl">
    <DialogHeader><DialogTitle>{routine ? "Edit workout" : "Create workout"}</DialogTitle><DialogDescription className="text-zinc-400">Choose your exercises and set the reps and weight for each set.</DialogDescription></DialogHeader>
    <Label htmlFor="routine-title">Workout name</Label><Input id="routine-title" value={title} maxLength={80} onChange={(event) => setTitle(event.target.value)} placeholder="Monday push" className="border-white/10 bg-zinc-900" />
    <Label htmlFor="routine-exercise">Add an exercise</Label><div className="flex gap-2"><select id="routine-exercise" value={selection} onChange={(event) => setSelection(event.target.value)} className="h-11 min-w-0 flex-1 rounded-xl border border-white/10 bg-zinc-900 px-3"><option value="">Choose from your library</option>{available.map((exercise) => <option key={exercise.slug} value={exercise.slug}>{exercise.name}</option>)}</select><Button type="button" disabled={!selection || saving || items.length >= MAX_ROUTINE_EXERCISES} onClick={() => { const exercise = available.find((item) => item.slug === selection); if (exercise) setItems((current) => [...current, { exercise, rows: initialSets(exercise) }]); setSelection(""); }}>Add</Button></div>
    {!items.length && <p className="py-4 text-sm text-zinc-400">Choose an exercise to begin. You can mix muscle groups.</p>}
    {items.map((item, index) => <section key={item.exercise.slug} className="rounded-xl border border-white/10 p-4"><h3 className="font-bold">{index + 1}. {item.exercise.name}</h3><div className="mt-2 flex flex-wrap gap-2"><Button type="button" size="sm" variant="outline" disabled={index === 0 || saving} onClick={() => move(index, -1)}>Move up</Button><Button type="button" size="sm" variant="outline" disabled={index === items.length - 1 || saving} onClick={() => move(index, 1)}>Move down</Button><Button type="button" size="sm" variant="outline" disabled={saving} onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))}>Remove exercise</Button></div><SetEditor name={item.exercise.name} rows={item.rows} onChange={(rows) => setItems((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, rows } : entry))} /></section>)}
    <div className="flex justify-end gap-2"><Button type="button" variant="outline" disabled={saving} onClick={onClose}>Cancel</Button><Button type="button" className="bg-lime-300 text-zinc-950" disabled={saving} onClick={save}>{saving ? "Saving…" : "Save workout"}</Button></div>
  </DialogContent></Dialog>;
}
