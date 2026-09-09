"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Check,
  ChevronRight,
  CirclePlus,
  Dumbbell,
  Flame,
  Gauge,
  LayoutDashboard,
  LogOut,
  Menu,
  Play,
  Plus,
  Ruler,
  Settings2,
  Sparkles,
  TimerReset,
  TrendingUp,
  UserRound,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

import type { CatalogExercise, WorkoutCategory } from "@/lib/catalog";
import type { MeasurementPoint, ProgramDay, TrackerData } from "@/lib/tracker-types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";

type View = "today" | "train" | "progress" | "plan";
type MetricKey = "weightKg" | "chestCm" | "waistCm" | "leftBicepCm" | "hipsCm" | "leftThighCm";

const metricLabels: Record<MetricKey, string> = {
  weightKg: "Body weight",
  chestCm: "Chest",
  waistCm: "Waist",
  leftBicepCm: "Biceps",
  hipsCm: "Hips",
  leftThighCm: "Thigh",
};

const metricUnits: Record<MetricKey, string> = {
  weightKg: "kg",
  chestCm: "cm",
  waistCm: "cm",
  leftBicepCm: "cm",
  hipsCm: "cm",
  leftThighCm: "cm",
};

const navItems: { value: View; label: string; icon: typeof LayoutDashboard }[] = [
  { value: "today", label: "Today", icon: LayoutDashboard },
  { value: "train", label: "Train", icon: Dumbbell },
  { value: "progress", label: "Progress", icon: BarChart3 },
  { value: "plan", label: "My plan", icon: CalendarDays },
];

type WorkoutEntry = Record<string, { reps: string; weightKg: string }[]>;

function Brand() {
  return (
    <div className="flex items-center gap-3" aria-label="JASMIC Workout Tracker">
      <div className="grid size-10 place-items-center rounded-[0.9rem] bg-lime-300 text-lg font-black text-zinc-950 shadow-[0_0_24px_rgba(199,255,74,0.18)]">
        J
      </div>
      <div className="leading-none">
        <div className="text-[0.72rem] font-black tracking-[0.32em] text-lime-300">JASMIC</div>
        <div className="mt-1 text-sm font-semibold tracking-tight text-white">WORKOUT TRACKER</div>
      </div>
    </div>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", { day: "2-digit", month: "short" }).format(new Date(`${date}T12:00:00`));
}

function number(value: FormDataEntryValue | null) {
  return Number.parseFloat(String(value ?? "0")) || 0;
}

function Delta({ value, positive = true }: { value: string; positive?: boolean }) {
  const Icon = positive ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`inline-flex items-center gap-1 text-sm font-bold ${positive ? "text-lime-300" : "text-orange-400"}`}>
      <Icon className="size-4" />
      {value}
    </span>
  );
}

function SectionHeading({ eyebrow, title, action }: { eyebrow: string; title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-white sm:text-3xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}

function Dashboard({ data, onStart }: { data: TrackerData; onStart: (category: WorkoutCategory) => void }) {
  const today = data.catalog.find((category) => category.id === "chest") ?? data.catalog[0];

  return (
    <div className="space-y-6">
      <section className="hero-panel overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900">
        <div className="relative z-10 flex min-h-[22rem] flex-col justify-between p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <span className="tag tag-lime"><Sparkles className="size-3.5" /> Today&apos;s focus</span>
            <span className="text-sm font-medium text-zinc-400">Week 6 · Day 2</span>
          </div>
          <div className="max-w-2xl">
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-orange-400">Push strength</p>
            <h1 className="text-5xl font-black leading-[0.92] tracking-[-0.065em] text-white sm:text-7xl">
              CHEST<br /><span className="text-lime-300">POWER</span>
            </h1>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-zinc-300">
              <span className="inline-flex items-center gap-2"><Dumbbell className="size-4 text-lime-300" /> {today.exercises.length} exercises</span>
              <span className="inline-flex items-center gap-2"><TimerReset className="size-4 text-lime-300" /> About 58 min</span>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button className="h-14 rounded-2xl bg-lime-300 px-7 text-base font-black text-zinc-950 hover:bg-lime-200" onClick={() => onStart(today)}>
              <Play className="size-5 fill-current" /> Start workout
            </Button>
            <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 backdrop-blur-sm sm:max-w-sm">
              <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/10 text-sm font-black text-white">01</div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">{today.exercises[0]?.name}</p>
                <p className="text-xs text-zinc-400">{today.exercises[0]?.sets} sets · {today.exercises[0]?.reps} reps</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="metric-card">
          <div className="metric-icon bg-lime-300/10 text-lime-300"><Activity className="size-5" /></div>
          <p className="metric-value">{data.stats.workoutsThisMonth}</p>
          <p className="metric-label">Workouts this month</p>
          <Delta value="3 vs last month" />
        </article>
        <article className="metric-card">
          <div className="metric-icon bg-sky-400/10 text-sky-300"><Gauge className="size-5" /></div>
          <p className="metric-value">{(data.stats.volumeKg / 1000).toFixed(1)}k</p>
          <p className="metric-label">Volume lifted (kg)</p>
          <Delta value={`${data.stats.volumeChangePct}%`} />
        </article>
        <article className="metric-card">
          <div className="metric-icon bg-orange-400/10 text-orange-400"><Flame className="size-5" /></div>
          <p className="metric-value">{data.stats.weeklyStreak}</p>
          <p className="metric-label">Week streak</p>
          <span className="text-sm font-semibold text-zinc-400">Best: 7 weeks</span>
        </article>
        <article className="metric-card">
          <div className="metric-icon bg-fuchsia-400/10 text-fuchsia-300"><Ruler className="size-5" /></div>
          <p className="metric-value">{data.stats.weightChangeKg} kg</p>
          <p className="metric-label">Body-weight change</p>
          <Delta value="On target" positive={false} />
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <article className="surface-card min-h-[22rem]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Training load</p>
              <h3 className="mt-2 text-xl font-black text-white">Volume is climbing</h3>
            </div>
            <Delta value="8.4%" />
          </div>
          <div className="mt-6 h-64 w-full" aria-label="Weekly training volume chart">
            <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 800, height: 256 }}>
              <AreaChart data={data.volume} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="volumeGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c7ff4a" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#c7ff4a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#2e2e33" strokeDasharray="3 6" />
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: "#8b8b93", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#8b8b93", fontSize: 12 }} tickFormatter={(value) => `${value / 1000}k`} />
                <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #36363b", borderRadius: 14 }} labelStyle={{ color: "#a1a1aa" }} formatter={(value) => [`${Number(value).toLocaleString()} kg`, "Volume"]} />
                <Area type="monotone" dataKey="volume" stroke="#c7ff4a" strokeWidth={3} fill="url(#volumeGlow)" activeDot={{ r: 5, fill: "#c7ff4a", stroke: "#18181b", strokeWidth: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="surface-card">
          <p className="eyebrow">Latest personal bests</p>
          <div className="mt-5 divide-y divide-white/8">
            {data.personalBests.map((best, index) => (
              <div key={best.exercise} className="flex items-center gap-4 py-4 first:pt-0">
                <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white/5 font-black text-zinc-400">{String(index + 1).padStart(2, "0")}</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-white">{best.exercise}</p>
                  <p className="mt-1 text-sm text-zinc-400">{best.value}</p>
                </div>
                <span className="text-sm font-black text-lime-300">{best.change}</span>
              </div>
            ))}
          </div>
          <Button variant="outline" className="mt-5 h-11 w-full rounded-xl border-white/10 bg-transparent text-white hover:bg-white/5 hover:text-white">
            View performance <ArrowRight className="size-4" />
          </Button>
        </article>
      </section>
    </div>
  );
}

function ExerciseRow({ exercise, index }: { exercise: CatalogExercise; index: number }) {
  return (
    <div className="group flex items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.025] p-4 transition hover:border-lime-300/25 hover:bg-white/[0.045]">
      <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-zinc-800 text-sm font-black text-zinc-400 group-hover:bg-lime-300 group-hover:text-zinc-950">
        {String(index + 1).padStart(2, "0")}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-white">{exercise.name}</p>
        <p className="mt-1 truncate text-sm text-zinc-500">{exercise.equipment}</p>
      </div>
      <div className="text-right">
        <p className="font-black text-white">{exercise.sets} sets</p>
        <p className="mt-1 text-sm text-zinc-400">{exercise.reps}</p>
      </div>
      <ChevronRight className="hidden size-5 text-zinc-600 sm:block" />
    </div>
  );
}

function TrainingLibrary({ catalog, onStart, onAddExercise }: { catalog: WorkoutCategory[]; onStart: (category: WorkoutCategory) => void; onAddExercise: () => void }) {
  const [activeCategoryId, setActiveCategoryId] = useState(catalog[0]?.id ?? "biceps");
  const active = catalog.find((item) => item.id === activeCategoryId) ?? catalog[0];

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Workout library"
        title="Choose what to train"
        action={<Button variant="outline" className="rounded-xl border-white/10 bg-transparent text-white hover:bg-white/5 hover:text-white" onClick={onAddExercise}><Plus className="size-4" /> Add exercise</Button>}
      />
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" aria-label="Muscle groups">
        {catalog.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategoryId(category.id)}
            className={`shrink-0 rounded-full border px-5 py-2.5 text-sm font-black transition ${activeCategoryId === category.id ? "border-lime-300 bg-lime-300 text-zinc-950" : "border-white/10 bg-zinc-900 text-zinc-400 hover:text-white"}`}
          >
            {category.title}
          </button>
        ))}
      </div>

      <section className="grid gap-5 xl:grid-cols-[0.72fr_1.28fr]">
        <article className="workout-poster rounded-[2rem] border border-white/10 p-6 sm:p-8" style={{ "--poster-accent": active.accent } as React.CSSProperties}>
          <div className="relative z-10 flex min-h-[28rem] flex-col justify-between">
            <div>
              <span className="tag border-white/10 bg-white/5 text-zinc-300">Starter routine</span>
              <p className="mt-8 text-sm font-black uppercase tracking-[0.24em] text-zinc-400">Train</p>
              <h2 className="mt-2 text-6xl font-black uppercase leading-[0.85] tracking-[-0.07em] text-white sm:text-7xl">{active.title}</h2>
              <div className="mt-5 h-1.5 w-20 rounded-full" style={{ background: active.accent }} />
            </div>
            <div>
              <div className="mb-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="text-3xl font-black text-white">{active.exercises.length}</p><p className="mt-1 text-sm text-zinc-400">Exercises</p></div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="text-3xl font-black text-white">~60</p><p className="mt-1 text-sm text-zinc-400">Minutes</p></div>
              </div>
              <Button className="h-14 w-full rounded-2xl bg-white text-base font-black text-zinc-950 hover:bg-zinc-200" onClick={() => onStart(active)}><Play className="size-5 fill-current" /> Start {active.title.toLowerCase()}</Button>
            </div>
          </div>
        </article>
        <article className="surface-card">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div><p className="eyebrow">Exercises</p><h3 className="mt-2 text-xl font-black text-white">{active.title} routine</h3></div>
            <span className="text-sm font-medium text-zinc-500">Editable later</span>
          </div>
          <div className="space-y-2.5">
            {active.exercises.map((exercise, index) => <ExerciseRow key={exercise.slug} exercise={exercise} index={index} />)}
          </div>
        </article>
      </section>
    </div>
  );
}

function ProgressView({ data, onAddMeasurement }: { data: TrackerData; onAddMeasurement: () => void }) {
  const [metric, setMetric] = useState<MetricKey>("weightKg");
  const first = data.measurements[0]?.[metric] ?? 0;
  const last = data.measurements.at(-1)?.[metric] ?? 0;
  const delta = last - first;
  const chartData = data.measurements.map((point) => ({ date: formatDate(point.measuredAt), value: point[metric] }));

  if (!data.measurements.length) {
    return (
      <div className="space-y-6">
        <SectionHeading eyebrow="Progress" title="Proof of your work" action={<Button className="rounded-xl bg-lime-300 font-black text-zinc-950 hover:bg-lime-200" onClick={onAddMeasurement}><Ruler className="size-4" /> New measurement</Button>} />
        <section className="surface-card grid min-h-[28rem] place-items-center text-center"><div className="max-w-md"><div className="mx-auto grid size-16 place-items-center rounded-2xl bg-lime-300/10 text-lime-300"><Ruler className="size-8" /></div><h3 className="mt-6 text-2xl font-black text-white">Create your baseline</h3><p className="mt-3 leading-7 text-zinc-400">Record today&apos;s measurements. Your charts will show how each area changes over time.</p><Button className="mt-6 rounded-xl bg-lime-300 font-black text-zinc-950 hover:bg-lime-200" onClick={onAddMeasurement}>Record first measurement</Button></div></section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Progress"
        title="Proof of your work"
        action={<Button className="rounded-xl bg-lime-300 font-black text-zinc-950 hover:bg-lime-200" onClick={onAddMeasurement}><Ruler className="size-4" /> New measurement</Button>}
      />
      <section className="grid gap-4 xl:grid-cols-[1.45fr_0.75fr]">
        <article className="surface-card min-h-[29rem]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="eyebrow">Body trend</p>
              <div className="mt-2 flex items-baseline gap-3"><span className="text-4xl font-black tracking-tight text-white">{last.toFixed(1)}</span><span className="font-bold text-zinc-500">{metricUnits[metric]}</span></div>
              <p className="mt-2 text-sm font-bold text-lime-300">{delta > 0 ? "+" : ""}{delta.toFixed(1)} {metricUnits[metric]} since first entry</p>
            </div>
            <Select value={metric} onValueChange={(value) => setMetric(value as MetricKey)}>
              <SelectTrigger className="h-11 w-full rounded-xl border-white/10 bg-white/5 text-white sm:w-44"><SelectValue /></SelectTrigger>
              <SelectContent>{Object.entries(metricLabels).map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="mt-7 h-72 w-full" aria-label={`${metricLabels[metric]} progress chart`}>
            <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 800, height: 288 }}>
              <LineChart data={chartData} margin={{ top: 10, right: 8, left: -24, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#2e2e33" strokeDasharray="3 6" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#8b8b93", fontSize: 12 }} />
                <YAxis domain={["dataMin - 2", "dataMax + 2"]} axisLine={false} tickLine={false} tick={{ fill: "#8b8b93", fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #36363b", borderRadius: 14 }} formatter={(value) => [`${Number(value).toFixed(1)} ${metricUnits[metric]}`, metricLabels[metric]]} />
                <Line type="monotone" dataKey="value" stroke="#c7ff4a" strokeWidth={3} dot={{ fill: "#18181b", stroke: "#c7ff4a", strokeWidth: 3, r: 4 }} activeDot={{ r: 6, fill: "#c7ff4a", stroke: "#18181b", strokeWidth: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>
        <article className="surface-card">
          <p className="eyebrow">Latest measurements</p>
          <div className="mt-5 space-y-2.5">
            {(["weightKg", "chestCm", "waistCm", "leftBicepCm", "hipsCm", "leftThighCm"] as MetricKey[]).map((key) => {
              const current = data.measurements.at(-1)?.[key] ?? 0;
              const previous = data.measurements.at(-2)?.[key] ?? current;
              const change = current - previous;
              return (
                <div key={key} className="flex items-center justify-between rounded-2xl bg-white/[0.035] px-4 py-3.5">
                  <span className="text-sm font-semibold text-zinc-400">{metricLabels[key]}</span>
                  <span className="font-black text-white">{current.toFixed(1)} <small className="font-semibold text-zinc-500">{metricUnits[key]}</small></span>
                  <span className={`min-w-14 text-right text-xs font-black ${change === 0 ? "text-zinc-600" : "text-lime-300"}`}>{change > 0 ? "+" : ""}{change.toFixed(1)}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-5 rounded-2xl border border-lime-300/20 bg-lime-300/8 p-4">
            <div className="flex items-center gap-2 font-black text-lime-300"><TrendingUp className="size-5" /> Tracking history</div>
            <div className="mt-4 flex items-center justify-between text-sm"><span className="text-zinc-400">{data.measurements.length} entries</span><span className="text-white">8 for a strong baseline</span></div>
            <Progress value={Math.min(100, (data.measurements.length / 8) * 100)} className="mt-3 h-2 bg-zinc-800 [&_[data-slot=progress-indicator]]:bg-lime-300" />
          </div>
        </article>
      </section>
    </div>
  );
}

function PlanView({ catalog, days, onAddDay }: { catalog: WorkoutCategory[]; days: ProgramDay[]; onAddDay: () => void }) {
  const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const accents: Record<string, string> = { Chest: "#ffce45", Back: "#ff6b35", Biceps: "#c7ff4a", Triceps: "#ff6b35", Legs: "#c7ff4a", Shoulders: "#54d6ff", Mobility: "#71717a", Custom: "#d8b4fe" };
  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Custom programme" title="Build your training week" action={<Button className="rounded-xl bg-lime-300 font-black text-zinc-950 hover:bg-lime-200" onClick={onAddDay}><CirclePlus className="size-4" /> Add workout day</Button>} />
      {days.length ? <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {days.map((item) => {
          const accent = accents[item.muscleGroup] ?? "#d8b4fe";
          const exerciseTotal = catalog.find((category) => category.title === item.muscleGroup)?.exercises.length ?? 0;
          return (
            <article key={item.id} className="surface-card group min-h-52 cursor-pointer transition hover:-translate-y-1 hover:border-white/20">
              <div className="flex items-center justify-between"><span className="text-xs font-black tracking-[0.22em] text-zinc-500">{dayNames[item.dayIndex % 7]}</span><Settings2 className="size-4 text-zinc-600 group-hover:text-white" /></div>
              <div className="mt-8"><div className="mb-4 size-2.5 rounded-full" style={{ background: accent, boxShadow: `0 0 18px ${accent}` }} /><h3 className="text-2xl font-black tracking-tight text-white">{item.title}</h3><p className="mt-2 text-sm text-zinc-500">{item.muscleGroup}</p></div>
              <div className="mt-7 flex items-center justify-between border-t border-white/8 pt-4"><span className="text-sm font-semibold text-zinc-400">{exerciseTotal ? `${exerciseTotal} exercises` : "Custom session"}</span><ChevronRight className="size-5 text-zinc-600" /></div>
            </article>
          );
        })}
      </section> : <section className="surface-card grid min-h-64 place-items-center text-center"><div className="max-w-md"><div className="mx-auto grid size-14 place-items-center rounded-2xl bg-lime-300/10 text-lime-300"><CalendarDays className="size-7" /></div><h3 className="mt-5 text-2xl font-black text-white">Your week is open</h3><p className="mt-2 leading-7 text-zinc-400">Add your first workout day and choose one of the starter routines.</p><Button className="mt-5 rounded-xl bg-lime-300 font-black text-zinc-950 hover:bg-lime-200" onClick={onAddDay}><CirclePlus className="size-4" /> Add first day</Button></div></section>}
      <section className="surface-card flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4"><div className="grid size-12 place-items-center rounded-2xl bg-lime-300/10 text-lime-300"><Sparkles className="size-6" /></div><div><h3 className="font-black text-white">Built to adapt</h3><p className="mt-1 text-sm text-zinc-400">A coach or administrator can assign a personal plan while every user can track their own history.</p></div></div>
        <span className="tag tag-lime shrink-0">Role-ready</span>
      </section>
    </div>
  );
}

function WorkoutDialog({ category, open, onOpenChange, isDemo }: { category: WorkoutCategory | null; open: boolean; onOpenChange: (open: boolean) => void; isDemo: boolean }) {
  const [entries, setEntries] = useState<WorkoutEntry>({});
  const [saving, setSaving] = useState(false);

  function entryFor(exercise: CatalogExercise, setIndex: number) {
    return entries[exercise.slug]?.[setIndex] ?? { reps: "", weightKg: "" };
  }

  function updateEntry(exercise: CatalogExercise, setIndex: number, field: "reps" | "weightKg", value: string) {
    setEntries((current) => {
      const rows = current[exercise.slug] ? [...current[exercise.slug]] : Array.from({ length: exercise.sets }, () => ({ reps: "", weightKg: "" }));
      rows[setIndex] = { ...rows[setIndex], [field]: value };
      return { ...current, [exercise.slug]: rows };
    });
  }

  async function finishWorkout() {
    if (!category) return;
    setSaving(true);
    const sets = Object.entries(entries).flatMap(([exerciseSlug, rows]) => rows.filter((row) => row.reps || row.weightKg).map((row, setIndex) => ({ exerciseSlug, setNumber: setIndex + 1, reps: Number(row.reps || 0), weightKg: Number(row.weightKg || 0) })));
    if (!isDemo) {
      const response = await fetch("/api/workouts", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ categoryId: category.id, name: `${category.title} workout`, sets }) });
      if (!response.ok) {
        toast.error("Workout could not be saved. Please try again.");
        setSaving(false);
        return;
      }
    }
    toast.success(isDemo ? "Preview workout completed" : "Workout saved to your history");
    setSaving(false);
    setEntries({});
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-hidden border-white/10 bg-zinc-950 p-0 text-white sm:max-w-3xl">
        <DialogHeader className="border-b border-white/10 p-5 text-left sm:p-6">
          <div className="flex items-center gap-3"><span className="tag tag-lime">Live workout</span><span className="text-sm text-zinc-500">00:00</span></div>
          <DialogTitle className="mt-2 text-3xl font-black tracking-tight">{category?.title ?? "Workout"}</DialogTitle>
          <DialogDescription className="text-zinc-400">Enter the repetitions and weight you complete. Empty sets are ignored.</DialogDescription>
        </DialogHeader>
        <div className="max-h-[58vh] space-y-4 overflow-y-auto px-5 py-1 sm:px-6">
          {category?.exercises.map((exercise, exerciseIndex) => (
            <section key={exercise.slug} className="rounded-2xl border border-white/8 bg-white/[0.025] p-4">
              <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black tracking-[0.2em] text-zinc-600">{String(exerciseIndex + 1).padStart(2, "0")}</p><h3 className="mt-1 font-black text-white">{exercise.name}</h3><p className="mt-1 text-sm text-zinc-500">Target: {exercise.sets} × {exercise.reps}</p></div><Dumbbell className="size-5 text-lime-300" /></div>
              <div className="mt-4 grid grid-cols-[2rem_1fr_1fr] gap-2 text-center text-xs font-bold uppercase tracking-wider text-zinc-600"><span>Set</span><span>kg</span><span>reps</span></div>
              <div className="mt-2 space-y-2">
                {Array.from({ length: exercise.sets }, (_, setIndex) => (
                  <div key={setIndex} className="grid grid-cols-[2rem_1fr_1fr] items-center gap-2"><span className="text-center text-sm font-black text-zinc-500">{setIndex + 1}</span><Input inputMode="decimal" aria-label={`${exercise.name} set ${setIndex + 1} weight in kilograms`} value={entryFor(exercise, setIndex).weightKg} onChange={(event) => updateEntry(exercise, setIndex, "weightKg", event.target.value)} placeholder="0" className="h-11 rounded-xl border-white/10 bg-zinc-900 text-center text-white" /><Input inputMode="numeric" aria-label={`${exercise.name} set ${setIndex + 1} repetitions`} value={entryFor(exercise, setIndex).reps} onChange={(event) => updateEntry(exercise, setIndex, "reps", event.target.value)} placeholder="0" className="h-11 rounded-xl border-white/10 bg-zinc-900 text-center text-white" /></div>
                ))}
              </div>
            </section>
          ))}
        </div>
        <DialogFooter className="border-t border-white/10 p-5 sm:p-6">
          <Button variant="outline" className="rounded-xl border-white/10 bg-transparent text-white hover:bg-white/5 hover:text-white" onClick={() => onOpenChange(false)}>Pause</Button>
          <Button className="rounded-xl bg-lime-300 font-black text-zinc-950 hover:bg-lime-200" onClick={finishWorkout} disabled={saving}><Check className="size-4" /> {saving ? "Saving…" : "Finish & save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MeasurementDialog({ open, onOpenChange, isDemo, onSaved }: { open: boolean; onOpenChange: (open: boolean) => void; isDemo: boolean; onSaved: (measurement: MeasurementPoint) => void }) {
  const [saving, setSaving] = useState(false);
  async function submit(formData: FormData) {
    const payload = {
      id: crypto.randomUUID(),
      measuredAt: String(formData.get("measuredAt")),
      weightKg: number(formData.get("weightKg")),
      neckCm: number(formData.get("neckCm")) || undefined,
      shouldersCm: number(formData.get("shouldersCm")) || undefined,
      chestCm: number(formData.get("chestCm")),
      waistCm: number(formData.get("waistCm")),
      leftBicepCm: number(formData.get("leftBicepCm")),
      rightBicepCm: number(formData.get("rightBicepCm")) || undefined,
      hipsCm: number(formData.get("hipsCm")),
      leftThighCm: number(formData.get("leftThighCm")),
      rightThighCm: number(formData.get("rightThighCm")) || undefined,
      leftCalfCm: number(formData.get("leftCalfCm")) || undefined,
      rightCalfCm: number(formData.get("rightCalfCm")) || undefined,
      bodyFatPct: number(formData.get("bodyFatPct")) || undefined,
    };
    const measurement: MeasurementPoint = payload;
    setSaving(true);
    if (!isDemo) {
      const response = await fetch("/api/measurements", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      if (!response.ok) {
        toast.error("Measurement could not be saved.");
        setSaving(false);
        return;
      }
      const result = await response.json();
      measurement.id = result.measurement.id;
    }
    onSaved(measurement);
    toast.success(isDemo ? "Preview measurement added" : "Measurement saved");
    setSaving(false);
    onOpenChange(false);
  }
  const fields = [
    { name: "weightKg", label: "Body weight", unit: "kg", required: true },
    { name: "neckCm", label: "Neck", unit: "cm" },
    { name: "shouldersCm", label: "Shoulders", unit: "cm" },
    { name: "chestCm", label: "Chest", unit: "cm", required: true },
    { name: "waistCm", label: "Waist", unit: "cm", required: true },
    { name: "hipsCm", label: "Hips", unit: "cm", required: true },
    { name: "leftBicepCm", label: "Left biceps", unit: "cm", required: true },
    { name: "rightBicepCm", label: "Right biceps", unit: "cm" },
    { name: "leftThighCm", label: "Left thigh", unit: "cm", required: true },
    { name: "rightThighCm", label: "Right thigh", unit: "cm" },
    { name: "leftCalfCm", label: "Left calf", unit: "cm" },
    { name: "rightCalfCm", label: "Right calf", unit: "cm" },
    { name: "bodyFatPct", label: "Body fat", unit: "%" },
  ];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto border-white/10 bg-zinc-950 text-white sm:max-w-xl">
        <DialogHeader><DialogTitle className="text-2xl font-black">Record your measurements</DialogTitle><DialogDescription className="text-zinc-400">Measure under similar conditions each time for a fair comparison.</DialogDescription></DialogHeader>
        <form action={submit} className="space-y-5">
          <div><Label htmlFor="measuredAt" className="text-zinc-300">Date</Label><Input id="measuredAt" name="measuredAt" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} className="mt-2 h-11 rounded-xl border-white/10 bg-zinc-900 text-white" /></div>
          <div className="grid grid-cols-2 gap-3">
            {fields.map((field) => <div key={field.name}><Label htmlFor={field.name} className="text-sm text-zinc-300">{field.label} <span className="text-zinc-600">({field.unit})</span></Label><Input id={field.name} name={field.name} type="number" inputMode="decimal" step="0.1" min="0" required={field.required} className="mt-2 h-11 rounded-xl border-white/10 bg-zinc-900 text-white" /></div>)}
          </div>
          <DialogFooter><Button type="button" variant="outline" className="rounded-xl border-white/10 bg-transparent text-white hover:bg-white/5 hover:text-white" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" disabled={saving} className="rounded-xl bg-lime-300 font-black text-zinc-950 hover:bg-lime-200">{saving ? "Saving…" : "Save measurements"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddExerciseDialog({ open, onOpenChange, isDemo, onSaved }: { open: boolean; onOpenChange: (open: boolean) => void; isDemo: boolean; onSaved: (exercise: CatalogExercise & { muscleGroup: string }) => void }) {
  const [saving, setSaving] = useState(false);
  async function submit(formData: FormData) {
    setSaving(true);
    const payload = Object.fromEntries(formData.entries());
    let saved = { slug: `custom-${Date.now()}`, name: String(payload.name), muscleGroup: String(payload.muscleGroup), equipment: String(payload.equipment), sets: Number(payload.sets), reps: String(payload.reps) };
    if (!isDemo) {
      const response = await fetch("/api/exercises", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      if (!response.ok) { toast.error("Exercise could not be added."); setSaving(false); return; }
      const result = await response.json();
      saved = { slug: result.exercise.slug, name: result.exercise.name, muscleGroup: result.exercise.muscleGroup, equipment: result.exercise.equipment, sets: result.exercise.defaultSets, reps: result.exercise.defaultReps };
    }
    onSaved(saved);
    toast.success(isDemo ? "Custom exercise is ready in preview mode" : "Custom exercise added");
    setSaving(false);
    onOpenChange(false);
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="border-white/10 bg-zinc-950 text-white"><DialogHeader><DialogTitle className="text-2xl font-black">Add a custom exercise</DialogTitle><DialogDescription className="text-zinc-400">Grow the exercise library without changing the application code.</DialogDescription></DialogHeader><form action={submit} className="space-y-4"><div><Label htmlFor="exerciseName">Exercise name</Label><Input id="exerciseName" name="name" required maxLength={100} className="mt-2 h-11 rounded-xl border-white/10 bg-zinc-900" /></div><div className="grid grid-cols-2 gap-3"><div><Label htmlFor="muscleGroup">Muscle group</Label><Input id="muscleGroup" name="muscleGroup" required maxLength={40} className="mt-2 h-11 rounded-xl border-white/10 bg-zinc-900" /></div><div><Label htmlFor="equipment">Equipment</Label><Input id="equipment" name="equipment" required maxLength={60} className="mt-2 h-11 rounded-xl border-white/10 bg-zinc-900" /></div></div><div className="grid grid-cols-2 gap-3"><div><Label htmlFor="sets">Default sets</Label><Input id="sets" name="sets" type="number" min="1" max="20" defaultValue="4" required className="mt-2 h-11 rounded-xl border-white/10 bg-zinc-900" /></div><div><Label htmlFor="reps">Rep target</Label><Input id="reps" name="reps" defaultValue="8–12" required maxLength={30} className="mt-2 h-11 rounded-xl border-white/10 bg-zinc-900" /></div></div><DialogFooter><Button type="button" variant="outline" className="rounded-xl border-white/10 bg-transparent text-white hover:bg-white/5 hover:text-white" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" disabled={saving} className="rounded-xl bg-lime-300 font-black text-zinc-950 hover:bg-lime-200">{saving ? "Adding…" : "Add exercise"}</Button></DialogFooter></form></DialogContent></Dialog>
  );
}

function AddDayDialog({ open, onOpenChange, catalog, isDemo, onSaved }: { open: boolean; onOpenChange: (open: boolean) => void; catalog: WorkoutCategory[]; isDemo: boolean; onSaved: (day: ProgramDay) => void }) {
  const [categoryId, setCategoryId] = useState(catalog[0]?.id ?? "");
  const [saving, setSaving] = useState(false);
  async function submit(formData: FormData) {
    setSaving(true);
    const payload = { title: String(formData.get("title")), dayIndex: Number(formData.get("dayIndex")), categoryId };
    let id = crypto.randomUUID();
    if (!isDemo) {
      const response = await fetch("/api/plans", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      if (!response.ok) { toast.error("Workout day could not be added."); setSaving(false); return; }
      const result = await response.json();
      id = result.planDay.id;
    }
    onSaved({ id, dayIndex: payload.dayIndex, title: payload.title, muscleGroup: catalog.find((category) => category.id === categoryId)?.title ?? "Custom" });
    toast.success(isDemo ? "Preview plan updated" : "Workout day added to your plan");
    setSaving(false);
    onOpenChange(false);
  }
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="border-white/10 bg-zinc-950 text-white"><DialogHeader><DialogTitle className="text-2xl font-black">Add a workout day</DialogTitle><DialogDescription className="text-zinc-400">Choose a starter routine, then adjust its exercises later.</DialogDescription></DialogHeader><form action={submit} className="space-y-4"><div><Label htmlFor="dayTitle">Day name</Label><Input id="dayTitle" name="title" required placeholder="Upper-body strength" maxLength={80} className="mt-2 h-11 rounded-xl border-white/10 bg-zinc-900" /></div><div><Label htmlFor="dayIndex">Day of week</Label><select id="dayIndex" name="dayIndex" className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-zinc-900 px-3 text-sm text-white" defaultValue="1"><option value="1">Monday</option><option value="2">Tuesday</option><option value="3">Wednesday</option><option value="4">Thursday</option><option value="5">Friday</option><option value="6">Saturday</option><option value="7">Sunday</option></select></div><div><Label>Starter routine</Label><Select value={categoryId} onValueChange={setCategoryId}><SelectTrigger className="mt-2 h-11 w-full rounded-xl border-white/10 bg-zinc-900 text-white"><SelectValue /></SelectTrigger><SelectContent>{catalog.map((category) => <SelectItem key={category.id} value={category.id}>{category.title} · {category.exercises.length} exercises</SelectItem>)}</SelectContent></Select></div><DialogFooter><Button type="button" variant="outline" className="rounded-xl border-white/10 bg-transparent text-white hover:bg-white/5 hover:text-white" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" disabled={saving} className="rounded-xl bg-lime-300 font-black text-zinc-950 hover:bg-lime-200">{saving ? "Adding…" : "Add to plan"}</Button></DialogFooter></form></DialogContent></Dialog>;
}

export function TrackerApp({ initialData, isDemo = false }: { initialData: TrackerData; isDemo?: boolean }) {
  const [view, setView] = useState<View>("today");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [activeWorkout, setActiveWorkout] = useState<WorkoutCategory | null>(null);
  const [measurementOpen, setMeasurementOpen] = useState(false);
  const [exerciseOpen, setExerciseOpen] = useState(false);
  const [dayOpen, setDayOpen] = useState(false);
  const [measurements, setMeasurements] = useState(initialData.measurements);
  const [catalog, setCatalog] = useState(initialData.catalog);
  const [programDays, setProgramDays] = useState(initialData.programDays);
  const data = useMemo(() => ({ ...initialData, measurements, catalog, programDays }), [initialData, measurements, catalog, programDays]);

  function changeView(next: View) { setView(next); setMobileMenu(false); window.scrollTo({ top: 0, behavior: "smooth" }); }

  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-100">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-white/8 bg-[#0d0d10] p-5 lg:flex lg:flex-col">
        <Brand />
        <nav className="mt-12 space-y-2" aria-label="Main navigation">
          {navItems.map((item) => { const Icon = item.icon; const active = view === item.value; return <button key={item.value} onClick={() => changeView(item.value)} className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-sm font-bold transition ${active ? "bg-lime-300 text-zinc-950" : "text-zinc-500 hover:bg-white/5 hover:text-white"}`}><Icon className="size-5" />{item.label}{active && <ArrowRight className="ml-auto size-4" />}</button>; })}
        </nav>
        <div className="mt-auto rounded-2xl border border-white/8 bg-white/[0.025] p-4"><div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-zinc-800"><UserRound className="size-5 text-zinc-300" /></div><div className="min-w-0"><p className="truncate text-sm font-black text-white">{data.user.displayName}</p><p className="text-xs text-zinc-500">{isDemo ? "Preview account" : data.user.role.toLowerCase()}</p></div></div>{isDemo ? <Link href="/login" className="mt-4 flex items-center justify-between text-sm font-bold text-lime-300">Sign in securely <ArrowRight className="size-4" /></Link> : <div className="mt-4 space-y-3"><Link href="/delete-account" className="block text-xs font-semibold text-zinc-600 hover:text-red-300">Delete account</Link><form action="/api/auth/logout" method="post"><button className="flex w-full items-center justify-between text-sm font-bold text-zinc-400 hover:text-white">Sign out <LogOut className="size-4" /></button></form></div>}</div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-white/8 bg-[#09090b]/90 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-[92rem] items-center justify-between">
            <div className="lg:hidden"><Brand /></div>
            <div className="hidden lg:block"><p className="text-sm text-zinc-500">Train with intent</p><p className="mt-0.5 font-black text-white">Ready to train, {data.user.displayName}</p></div>
            <div className="flex items-center gap-2">{isDemo && <span className="hidden rounded-full border border-orange-400/20 bg-orange-400/10 px-3 py-1.5 text-xs font-black text-orange-300 sm:inline-flex">PREVIEW MODE</span>}<button aria-label="Open menu" className="grid size-10 place-items-center rounded-xl border border-white/10 text-zinc-300 lg:hidden" onClick={() => setMobileMenu((value) => !value)}>{mobileMenu ? <X className="size-5" /> : <Menu className="size-5" />}</button></div>
          </div>
          {mobileMenu && <nav className="mx-auto mt-4 grid max-w-[92rem] grid-cols-2 gap-2 border-t border-white/8 pt-4 lg:hidden">{navItems.map((item) => { const Icon = item.icon; return <button key={item.value} onClick={() => changeView(item.value)} className={`flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-bold ${view === item.value ? "bg-lime-300 text-zinc-950" : "bg-white/5 text-zinc-400"}`}><Icon className="size-4" />{item.label}</button>; })}{!isDemo && <Link href="/delete-account" className="col-span-2 rounded-xl bg-white/5 px-3 py-3 text-center text-sm font-bold text-zinc-500">Account & deletion</Link>}</nav>}
        </header>

        <div className="mx-auto max-w-[92rem] px-4 py-5 pb-28 sm:px-6 sm:py-7 lg:px-8 lg:pb-10">
          {isDemo && <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-orange-400/20 bg-orange-400/[0.07] px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"><span className="text-orange-100"><strong>Interactive preview:</strong> entries reset when you refresh. A signed-in account saves securely.</span><Link href="/register" className="inline-flex shrink-0 items-center gap-2 font-black text-orange-300">Create account <ArrowRight className="size-4" /></Link></div>}
          {view === "today" && <Dashboard data={data} onStart={(category) => setActiveWorkout(category)} />}
          {view === "train" && <TrainingLibrary catalog={data.catalog} onStart={(category) => setActiveWorkout(category)} onAddExercise={() => setExerciseOpen(true)} />}
          {view === "progress" && <ProgressView data={data} onAddMeasurement={() => setMeasurementOpen(true)} />}
          {view === "plan" && <PlanView catalog={data.catalog} days={data.programDays} onAddDay={() => setDayOpen(true)} />}
        </div>
      </div>

      <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-4 rounded-[1.4rem] border border-white/10 bg-zinc-900/95 p-1.5 shadow-2xl backdrop-blur-xl lg:hidden" aria-label="Mobile navigation">
        {navItems.map((item) => { const Icon = item.icon; const active = view === item.value; return <button key={item.value} onClick={() => changeView(item.value)} className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[0.72rem] font-bold ${active ? "bg-lime-300 text-zinc-950" : "text-zinc-500"}`}><Icon className="size-5" />{item.label}</button>; })}
      </nav>

      <WorkoutDialog category={activeWorkout} open={Boolean(activeWorkout)} onOpenChange={(open) => !open && setActiveWorkout(null)} isDemo={isDemo} />
      <MeasurementDialog open={measurementOpen} onOpenChange={setMeasurementOpen} isDemo={isDemo} onSaved={(measurement) => setMeasurements((current) => [...current, measurement].sort((a, b) => a.measuredAt.localeCompare(b.measuredAt)))} />
      <AddExerciseDialog open={exerciseOpen} onOpenChange={setExerciseOpen} isDemo={isDemo} onSaved={(exercise) => setCatalog((current) => {
        const existing = current.find((category) => category.id === "custom");
        if (existing) return current.map((category) => category.id === "custom" ? { ...category, exercises: [...category.exercises, exercise] } : category);
        return [...current, { id: "custom", title: "Custom", accent: "#d8b4fe", exercises: [exercise] }];
      })} />
      <AddDayDialog open={dayOpen} onOpenChange={setDayOpen} catalog={data.catalog} isDemo={isDemo} onSaved={(day) => setProgramDays((current) => [...current, day].sort((a, b) => a.dayIndex - b.dayIndex))} />
      <Toaster richColors position="top-right" />
    </main>
  );
}
