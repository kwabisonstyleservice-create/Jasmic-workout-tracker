"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DeleteAccountForm({ email }: { email: string }) {
  const router = useRouter();
  const [confirmation, setConfirmation] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const response = await fetch("/api/account/delete", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ password, confirmation }) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(result.error ?? "The account could not be deleted.");
      setSubmitting(false);
      return;
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-5 rounded-3xl border border-red-400/20 bg-red-400/[.055] p-5 sm:p-7">
      <div className="flex items-start gap-3"><div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-red-400/10 text-red-300"><AlertTriangle className="size-5" /></div><div><h2 className="font-black text-white">Permanently delete {email}</h2><p className="mt-1 text-sm leading-6 text-zinc-400">Workout history, measurements, plans, custom exercises and active sessions will be removed. This cannot be undone.</p></div></div>
      <div><Label htmlFor="deletePassword">Current password</Label><Input id="deletePassword" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required className="mt-2 h-12 rounded-2xl border-white/10 bg-zinc-950" /></div>
      <div><Label htmlFor="deleteConfirmation">Type DELETE to confirm</Label><Input id="deleteConfirmation" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required className="mt-2 h-12 rounded-2xl border-white/10 bg-zinc-950" /></div>
      {error && <p role="alert" className="rounded-xl bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-200">{error}</p>}
      <Button type="submit" disabled={submitting || confirmation !== "DELETE" || !password} className="h-12 w-full rounded-2xl bg-red-500 font-black text-white hover:bg-red-400"><Trash2 className="size-4" /> {submitting ? "Deleting…" : "Delete my account"}</Button>
    </form>
  );
}

