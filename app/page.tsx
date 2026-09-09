import { TrackerApp } from "@/components/tracker/tracker-app";
import { demoTrackerData } from "@/lib/demo-data";

export default function Home() {
  return <TrackerApp initialData={demoTrackerData} isDemo />;
}
