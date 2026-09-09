"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, BarChart3, Check, Dumbbell, Eye, EyeOff, LockKeyhole, Ruler, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [terms, setTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const register = mode === "register";

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    const payload = {
      ...(register ? { displayName: String(formData.get("displayName") ?? ""), terms } : {}),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    };
    try {
      const response = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(result.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      router.push("/app");
      router.refresh();
    } catch {
      setError("The service could not be reached. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="auth-art relative hidden overflow-hidden border-r border-white/8 p-10 lg:flex lg:flex-col lg:justify-between xl:p-14">
          <Link href="/" className="relative z-10 flex w-fit items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-lime-300 text-xl font-black text-zinc-950">J</span>
            <span><strong className="block text-xs tracking-[.3em] text-lime-300">JASMIC</strong><span className="mt-1 block font-black">WORKOUT TRACKER</span></span>
          </Link>
          <div className="relative z-10 max-w-2xl">
            <p className="eyebrow text-orange-400">Every set counts</p>
            <h1 className="mt-5 text-6xl font-black leading-[.9] tracking-[-.065em] xl:text-8xl">TRAIN.<br />MEASURE.<br /><span className="text-lime-300">IMPROVE.</span></h1>
            <div className="mt-10 grid grid-cols-3 gap-3">
              {[{ icon: Dumbbell, text: "Workout logs" }, { icon: Ruler, text: "Body tracking" }, { icon: BarChart3, text: "Progress charts" }].map((item) => { const Icon = item.icon; return <div key={item.text} className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur"><Icon className="size-5 text-lime-300" /><p className="mt-3 text-sm font-bold text-zinc-300">{item.text}</p></div>; })}
            </div>
          </div>
          <div className="relative z-10 flex items-center gap-2 text-sm text-zinc-500"><ShieldCheck className="size-4 text-lime-300" /> Passwords are salted and hashed. Sessions use protected cookies.</div>
        </section>

        <section className="flex items-center justify-center px-5 py-10 sm:px-10">
          <div className="w-full max-w-md">
            <div className="mb-10 flex items-center justify-between lg:hidden"><Link href="/" className="flex items-center gap-2 font-black"><span className="grid size-9 place-items-center rounded-xl bg-lime-300 text-zinc-950">J</span> JASMIC</Link><Link href="/" className="text-sm font-bold text-zinc-500">Preview</Link></div>
            <Link href="/" className="mb-8 hidden w-fit items-center gap-2 text-sm font-bold text-zinc-500 transition hover:text-white lg:flex"><ArrowLeft className="size-4" /> Back to preview</Link>
            <div className="mb-8"><span className="tag tag-lime"><LockKeyhole className="size-3.5" /> Secure account</span><h2 className="mt-5 text-4xl font-black tracking-[-.045em]">{register ? "Create your account" : "Welcome back"}</h2><p className="mt-3 text-base leading-7 text-zinc-400">{register ? "Start building a measurable training history." : "Continue your plan and log today’s work."}</p></div>
            <form onSubmit={submit} className="space-y-5" noValidate>
              {register && <div><Label htmlFor="displayName" className="font-bold text-zinc-300">Full name</Label><Input id="displayName" name="displayName" autoComplete="name" required minLength={2} maxLength={100} placeholder="Michael Esson" className="mt-2 h-13 rounded-2xl border-white/10 bg-white/[.035] px-4 text-base text-white placeholder:text-zinc-700" /></div>}
              <div><Label htmlFor="email" className="font-bold text-zinc-300">Email address</Label><Input id="email" name="email" type="email" inputMode="email" autoCapitalize="none" autoComplete="email" required maxLength={320} placeholder="you@example.com" className="mt-2 h-13 rounded-2xl border-white/10 bg-white/[.035] px-4 text-base text-white placeholder:text-zinc-700" /></div>
              <div><Label htmlFor="password" className="font-bold text-zinc-300">Password</Label><div className="relative mt-2"><Input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete={register ? "new-password" : "current-password"} required minLength={register ? 12 : 1} maxLength={128} placeholder={register ? "At least 12 characters" : "Your password"} className="h-13 rounded-2xl border-white/10 bg-white/[.035] px-4 pr-12 text-base text-white placeholder:text-zinc-700" /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white" onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}</button></div>{register && <p className="mt-2 text-xs leading-5 text-zinc-600">Use 12 or more characters. A password manager is recommended.</p>}</div>
              {register && <div className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[.025] p-4"><Checkbox id="terms" checked={terms} onCheckedChange={(value) => setTerms(value === true)} className="mt-0.5 border-zinc-600 data-[state=checked]:border-lime-300 data-[state=checked]:bg-lime-300 data-[state=checked]:text-zinc-950" /><Label htmlFor="terms" className="text-sm font-medium leading-6 text-zinc-400">I agree to the <Link href="/privacy" className="font-bold text-white underline decoration-zinc-600 underline-offset-4">privacy policy</Link> and understand that fitness and body-measurement data will be stored in my account.</Label></div>}
              {error && <div role="alert" className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-200">{error}</div>}
              <Button type="submit" disabled={submitting || (register && !terms)} className="h-14 w-full rounded-2xl bg-lime-300 text-base font-black text-zinc-950 hover:bg-lime-200 disabled:bg-zinc-700 disabled:text-zinc-400">{submitting ? "Please wait…" : register ? "Create account" : "Sign in"}<ArrowRight className="size-5" /></Button>
            </form>
            <p className="mt-7 text-center text-sm text-zinc-500">{register ? "Already have an account?" : "New to JASMIC?"} <Link href={register ? "/login" : "/register"} className="font-black text-white hover:text-lime-300">{register ? "Sign in" : "Create an account"}</Link></p>
            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-zinc-700"><Check className="size-3.5" /> Your workout records remain private to your account.</div>
          </div>
        </section>
      </div>
    </main>
  );
}
