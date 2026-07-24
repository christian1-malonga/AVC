import { createFileRoute } from "@tanstack/react-router";
import { CustodianDashboard } from "@/components/dashboard/CustodianDashboard";

export const Route = createFileRoute("/_app/music")({
  component: CustodianDashboard,
  ssr: false,
  head: () => ({ meta: [{ title: "Music Library — AVC" }] }),
});
