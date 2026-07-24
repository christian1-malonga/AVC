import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth/context";
import { Logo } from "@/components/layout/Logo";

export const Route = createFileRoute("/")({
  component: IndexRedirect,
  ssr: false,
});

function IndexRedirect() {
  const { user, hydrated } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!hydrated) return;
    if (!user) navigate({ to: "/login" });
    else if (!user.approved) navigate({ to: "/pending" });
    else if (!user.section) navigate({ to: "/select-section" });
    else navigate({ to: "/dashboard" });
  }, [user, hydrated, navigate]);
  return (
    <div className="min-h-screen grid place-items-center bg-gradient-hero text-white">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <Logo invert />
        <span className="text-sm text-white/60">Loading...</span>
      </div>
    </div>
  );
}
