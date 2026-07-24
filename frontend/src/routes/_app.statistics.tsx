import { createFileRoute } from "@tanstack/react-router";
import { PresidentDashboard } from "@/components/dashboard/PresidentDashboard";

export const Route = createFileRoute("/_app/statistics")({
  component: PresidentDashboard,
  ssr: false,
  head: () => ({ meta: [{ title: "Statistics — AVC" }] }),
});
