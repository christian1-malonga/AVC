import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { AvcBot } from "@/components/chatbot/AvcBot";
import { useAuth } from "@/lib/auth/context";
import { authService } from "@/lib/api/services/auth";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Logo } from "@/components/layout/Logo";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
  ssr: false,
});

function AppLayout() {
  const { user, hydrated, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const fetchedRef = useRef(false);

  // Refresh user data from backend on mount
  useEffect(() => {
    if (!hydrated || !user || fetchedRef.current) return;
    fetchedRef.current = true;
    authService
      .me()
      .then((res) => updateUser(res.data))
      .catch((err) => {
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          logout();
        }
      });
  }, [hydrated, user, logout, updateUser]);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) navigate({ to: "/login" });
    else if (!user.approved) navigate({ to: "/pending" });
    else if (!user.section) navigate({ to: "/select-section" });
  }, [user, hydrated, navigate]);

  if (!hydrated || !user) {
    return (
      <div className="min-h-screen grid place-items-center bg-background text-muted-foreground">
        Loading...
      </div>
    );
  }

  const initials = user.full_name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const title = pathname.replace(/^\//, "").split("/")[0] || "dashboard";

  return (
    <SidebarProvider>
      <div className="flex min-h-[100dvh] w-full overflow-x-clip bg-background">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex min-h-14 shrink-0 items-center gap-1 border-b border-border bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:gap-2 sm:px-4 lg:px-6">
            <SidebarTrigger className="shrink-0" />
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <Logo compact className="min-w-0 lg:hidden" />
              <span className="hidden xl:inline-flex items-center gap-2 text-xs text-muted-foreground">
                <span className="uppercase tracking-[0.15em]">AVC</span>
                <span className="opacity-40">/</span>
              </span>
              <span className="min-w-0 truncate capitalize text-xs font-medium text-foreground">
                {title}
              </span>
            </div>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 sm:h-9 sm:w-9"
              onClick={() => navigate({ to: "/notifications" })}
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
            </Button>
            <div className="ml-1 hidden items-center gap-2.5 border-l border-border pl-3 md:flex">
              <div className="min-w-0 text-right leading-tight">
                <p className="max-w-[140px] truncate text-xs font-medium">{user.full_name}</p>
                <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                  {user.role}
                </p>
              </div>
              <Avatar className="h-8 w-8 shrink-0 rounded-md">
                <AvatarFallback className="rounded-md bg-primary text-[10px] font-medium text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
          </header>
          <main className="mx-auto w-full min-w-0 max-w-[1720px] flex-1 overflow-x-clip p-3 sm:p-5 md:p-6 lg:p-8 xl:p-10">
            <Outlet />
          </main>
        </div>
        <AvcBot />
      </div>
    </SidebarProvider>
  );
}
