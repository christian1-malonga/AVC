import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth/context";
import { SecretaryDashboard } from "@/components/dashboard/SecretaryDashboard";
import { CustodianDashboard } from "@/components/dashboard/CustodianDashboard";

export const Route = createFileRoute("/_app/uploads")({
  component: UploadsPage,
  ssr: false,
  head: () => ({ meta: [{ title: "Uploads — AVC" }] }),
});

function UploadsPage() {
  const { user } = useAuth();
  if (user?.role === "custodian") return <CustodianDashboard />;
  return <SecretaryDashboard />;
}
