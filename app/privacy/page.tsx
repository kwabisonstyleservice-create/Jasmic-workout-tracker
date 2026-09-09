import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata: Metadata = { title: "Privacy policy", description: "Privacy policy for JASMIC Workout Tracker." };

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#09090b] px-5 py-10 text-zinc-100 sm:px-8 sm:py-16">
      <article className="mx-auto max-w-3xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-white"><ArrowLeft className="size-4" /> Back to JASMIC</Link>
        <div className="mt-10 flex items-center gap-3"><div className="grid size-12 place-items-center rounded-2xl bg-lime-300 text-xl font-black text-zinc-950">J</div><div><p className="text-xs font-black tracking-[.25em] text-lime-300">JASMIC</p><p className="mt-1 font-black">WORKOUT TRACKER</p></div></div>
        <p className="eyebrow mt-12">Effective 8 September 2026</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-.05em] sm:text-6xl">Privacy policy</h1>
        <p className="mt-6 text-lg leading-8 text-zinc-400">JASMIC Workout Tracker is operated by Essmic Technical Operations, KvK 83716181, P S Gerbrandypad 18, 1314 NL Almere, the Netherlands. Questions about privacy can be sent to <a className="font-bold text-lime-300" href="mailto:michael@jasmicreations.com">michael@jasmicreations.com</a>.</p>

        <div className="mt-10 space-y-8 text-base leading-8 text-zinc-400">
          <section><h2 className="text-xl font-black text-white">1. Information we collect</h2><p className="mt-2">We collect the account information you provide, including your name and email address. Your password is stored only as a salted cryptographic hash. When you use the tracker, we store workout plans, completed exercises, repetitions, weight lifted, notes, body weight, body-part measurements, body-fat percentage when supplied, and dates associated with these records. We also process limited security information such as session identifiers and sign-in attempt counters.</p></section>
          <section><h2 className="text-xl font-black text-white">2. Why we use it</h2><p className="mt-2">We use this information to operate your account, save and personalise training plans, calculate progress, display charts, protect accounts against abuse, provide support, and maintain the reliability of the service. We do not use your fitness or body data for advertising.</p></section>
          <section><h2 className="text-xl font-black text-white">3. Health and fitness information</h2><p className="mt-2">Workout records and body measurements may be sensitive personal information. They are private to your account unless you deliberately work with an authorised coach or administrator. JASMIC is a tracking tool and does not provide medical diagnosis or emergency advice.</p></section>
          <section><h2 className="text-xl font-black text-white">4. Service providers and transfers</h2><p className="mt-2">The application uses hosting and database service providers to process information on our behalf. At launch these are expected to include Vercel for application hosting and Neon for the PostgreSQL database. They may process data in countries where they operate under their applicable contractual safeguards. We do not sell personal information.</p></section>
          <section><h2 className="text-xl font-black text-white">5. Security and retention</h2><p className="mt-2">Traffic is encrypted with HTTPS. Account sessions use protected cookies, passwords use one-way salted hashing, database queries are validated and account records are separated by user identity. We keep account and fitness records while your account is active. When an account is deleted, associated application records are deleted, subject only to a limited period where backups or legal obligations require retention.</p></section>
          <section><h2 className="text-xl font-black text-white">6. Your choices and rights</h2><p className="mt-2">Depending on your location, you may ask to access, correct, export, restrict, object to, or erase your personal information. You may delete your account through the <Link href="/delete-account" className="font-bold text-lime-300">account deletion page</Link>. You may also contact us using the email above. You can complain to your local data-protection authority if you believe your rights have not been respected.</p></section>
          <section><h2 className="text-xl font-black text-white">7. Children</h2><p className="mt-2">The current service is intended for adults and is not designed for children. A future version offered to minors will require an age-appropriate privacy design and any necessary parental authorisation before launch.</p></section>
          <section><h2 className="text-xl font-black text-white">8. Changes</h2><p className="mt-2">We may update this policy when the application or its providers change. The current effective date will be shown at the top of this page, and material changes will be communicated in the application where appropriate.</p></section>
        </div>
        <div className="mt-12 flex items-start gap-3 rounded-2xl border border-lime-300/20 bg-lime-300/[.07] p-5 text-sm leading-6 text-zinc-300"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-lime-300" /> This policy must be reviewed against the final production configuration, providers, retention practices and Play Console disclosures before public release.</div>
      </article>
    </main>
  );
}

