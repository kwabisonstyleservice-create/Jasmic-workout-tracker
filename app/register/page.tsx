import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/tracker/auth-form";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Create account" };
export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const user = await getCurrentUser().catch(() => null);
  if (user) redirect("/app");
  return <AuthForm mode="register" />;
}
