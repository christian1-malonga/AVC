import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth/context";

import { MemberDashboard } from "@/components/dashboard/MemberDashboard";
import { PresidentDashboard } from "@/components/dashboard/PresidentDashboard";
import { SecretaryDashboard } from "@/components/dashboard/SecretaryDashboard";
import { CustodianDashboard } from "@/components/dashboard/CustodianDashboard";
import { ProvostDashboard } from "@/components/dashboard/ProvostDashboard";
import { BirthdayBanner } from "@/components/dashboard/BirthdayBanner";

export const Route = createFileRoute("/_app/dashboard")({
  component: DashboardRouter,
  ssr: false,
  head: () => ({ meta: [{ title: "Dashboard — AVC" }] }),
});

function DashboardRouter() {
  const { user } = useAuth();
  if (!user) return null;

  const dashboard = (() => {
    switch (user.role) {
      case "president":
        return <PresidentDashboard />;
      case "secretary":
        return <SecretaryDashboard />;
      case "custodian":
        return <CustodianDashboard />;
      case "provost":
        return <ProvostDashboard />;
      default:
        return <MemberDashboard />;
    }
  })();

  return <div className="space-y-6"><BirthdayBanner />{dashboard}</div>;
}
