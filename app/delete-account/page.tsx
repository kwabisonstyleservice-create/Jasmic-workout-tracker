import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DeleteAccountForm } from "@/components/tracker/delete-account-form";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Delete account" };
export const dynamic = "force-dynamic";

export default async function DeleteAccountPage() {
  const user = await getCurrentUser().catch(() => null);
  return (
    <main className="min-h-screen bg-[#09090b] px-5 py-10 text-white sm:px-8 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <Link href={user ? "/app" : "/"} className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-white"><ArrowLeft className="size-4" /> Back</Link>
        <p className="eyebrow mt-12">Account control</p><h1 className="mt-3 text-4xl font-black tracking-[-.05em] sm:text-6xl">Delete your JASMIC account</h1>
        <p className="mt-5 text-lg leading-8 text-zinc-400">You can permanently remove your account and its associated fitness data here.</p>
        {user ? <DeleteAccountForm email={user.email} /> : <div className="mt-8 rounded-3xl border border-white/10 bg-white/[.035] p-6"><h2 className="text-xl font-black">Sign in to continue</h2><p className="mt-2 leading-7 text-zinc-400">For security, account deletion requires your current password. If you cannot access the account, email <a href="mailto:michael@jasmicreations.com?subject=JASMIC%20account%20deletion" className="font-bold text-lime-300">michael@jasmicreations.com</a> from the address registered on the account.</p><Link href="/login" className="mt-5 inline-flex rounded-xl bg-lime-300 px-5 py-3 font-black text-zinc-950">Sign in</Link></div>}
        <p className="mt-8 text-sm leading-6 text-zinc-600">Requests that require identity verification may take up to 30 days. Records that must be retained for a legal obligation will be isolated and deleted when that obligation ends.</p>
      </div>
    </main>
  );
}

