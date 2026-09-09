import { redirect } from "next/navigation";
import { TrackerApp } from "@/components/tracker/tracker-app";
import { getCurrentUser } from "@/lib/auth";
import { getTrackerData } from "@/lib/tracker-data";

export const dynamic = "force-dynamic";

export default async function AppPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const data = await getTrackerData(user);
  return <TrackerApp initialData={data} />;
}
