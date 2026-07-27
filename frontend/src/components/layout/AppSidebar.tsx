import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  Bell,
  FileText,
  LogOut,
  Megaphone,
  Music,
  Settings,
  Shield,
  Upload,
  User,
  Users,
  Wallet,
} from "lucide-react";
import { type ComponentType, useMemo } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth/context";
import { Logo } from "@/components/layout/Logo";

interface NavItem {
  title: string;
  url: string;
  icon: ComponentType<{ className?: string }>;
}

const accountNav: NavItem[] = [
  { title: "Profile", url: "/profile", icon: User },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Settings", url: "/settings", icon: Settings },
];

const memberNav: NavItem[] = [
  { title: "Documents", url: "/documents", icon: FileText },
  { title: "Debt", url: "/debt", icon: Wallet },
  { title: "Announcements", url: "/announcements", icon: Megaphone },
];

const presidentNav: NavItem[] = [
  { title: "Members", url: "/members", icon: Users },
  { title: "Approvals", url: "/approvals", icon: Shield },
  { title: "Documents", url: "/documents", icon: FileText },
  { title: "Music Library", url: "/music", icon: Music },
];

const provostNav: NavItem[] = [
  { title: "Attendance", url: "/attendance", icon: Users },
  { title: "Upload Debtors", url: "/upload", icon: Upload },
];


const secretaryNav: NavItem[] = [
  { title: "Upload", url: "/uploads", icon: Upload },
  { title: "Documents", url: "/documents", icon: FileText },
  { title: "Debt", url: "/debt", icon: Wallet },
];

const custodianNav: NavItem[] = [
  { title: "Music Library", url: "/music", icon: Music },
  { title: "Upload Music", url: "/uploads", icon: Upload },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const { state, isMobile } = useSidebar();
  const collapsed = state === "collapsed" && !isMobile;
  const pathname = useRouterState({ select: (router) => router.location.pathname });
  const navigate = useNavigate();

  const workspaceItems = useMemo<NavItem[]>(() => {
    switch (user?.role) {
      case "president":
        return presidentNav;
      case "provost":
        return provostNav;
      case "secretary":
        return secretaryNav;
      case "custodian":
        return custodianNav;
      default:
        return memberNav;
    }
  }, [user?.role]);

  const isActive = (url: string) => pathname === url || pathname.startsWith(`${url}/`);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-2">
        <Link
          to="/dashboard"
          aria-label="Go to dashboard"
          className="block rounded-md outline-none transition-colors hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          <Logo compact hideText={collapsed} className="px-2 py-2" />
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-1 py-2">
        <SidebarGroup className="p-2">
          <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/45">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {workspaceItems.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.title}
                      className="rounded-md text-sidebar-foreground/80 transition-colors data-[active=true]:border-l-2 data-[active=true]:border-l-[var(--gold)] data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground hover:bg-sidebar-accent/75"
                    >
                      <Link to={item.url} className="flex min-w-0 items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        <span className="truncate text-sm group-data-[collapsible=icon]:hidden">
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-2 p-2">
          <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/45">
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountNav.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                    className="rounded-md text-sidebar-foreground/80 transition-colors data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground hover:bg-sidebar-accent/75"
                  >
                    <Link to={item.url} className="flex min-w-0 items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span className="truncate text-sm group-data-[collapsible=icon]:hidden">
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Log out"
              onClick={() => {
                logout();
                navigate({ to: "/login" });
              }}
              className="rounded-md text-sidebar-foreground/80 hover:bg-destructive/20 hover:text-sidebar-foreground"
            >
              <LogOut className="h-4 w-4" />
              <span className="truncate text-sm group-data-[collapsible=icon]:hidden">Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
