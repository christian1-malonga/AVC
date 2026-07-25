import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  UserCheck,
  Clock,
  FileText,
  Activity,
  Upload,
  PlusCircle,
  Megaphone,
} from "lucide-react";
import { StatCard } from "./StatCard";
import { useNavigate } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { statsService } from "@/lib/api/services/stats";
import { membersService } from "@/lib/api/services/members";
import { notificationsService } from "@/lib/api/services/notifications";
import { MemberDashboard } from "./MemberDashboard";
import { DashboardFooter } from "./DashboardFooter";
import type { AuthUser } from "@/lib/api/services/auth";
import type { NotificationItem } from "@/lib/api/services/notifications";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface OverviewStats {
  member_count: number;
  pending_approvals: number;
  approved_users: number;
  debt_total: number;
  document_count: number;
  music_count: number;
  notification_count: number;
  section_distribution?: Record<string, number>;
}

export function PresidentDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [pendingUsers, setPendingUsers] = useState<AuthUser[]>([]);
  const [recentActivity, setRecentActivity] = useState<NotificationItem[]>([]);
  const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false);
  const [announcementMsg, setAnnouncementMsg] = useState("");
  const [postingAnnouncement, setPostingAnnouncement] = useState(false);

  const sectionChartData = stats?.section_distribution
    ? Object.entries(stats.section_distribution).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }))
    : [];

  const hasSectionData = sectionChartData.some((d) => d.value > 0);

  const COLORS = {
    Bass: "#3b82f6",
    Tenor: "#8b5cf6",
    Alto: "#ec4899",
    Soprano: "#10b981",
  };

  const loadData = () => {
    Promise.all([
      statsService.overview(),
      membersService.pendingApprovals(),
      notificationsService.list(),
    ])
      .then(([statsResponse, pendingResponse, notificationsResponse]) => {
        setStats(statsResponse.data as OverviewStats);
        setPendingUsers(pendingResponse.data);
        setRecentActivity(notificationsResponse.data.slice(0, 4));
      })
      .catch(() => toast.error("Unable to load dashboard data."));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await membersService.approve(id);
      toast.success("Member approved successfully.");
      setPendingUsers((prev) => prev.filter((u) => u.id !== id));
      loadData();
    } catch {
      toast.error("Failed to approve member.");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await membersService.reject(id);
      toast.success("Member rejected.");
      setPendingUsers((prev) => prev.filter((u) => u.id !== id));
      loadData();
    } catch {
      toast.error("Failed to reject member.");
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!announcementMsg.trim()) return;
    setPostingAnnouncement(true);
    try {
      await notificationsService.createAnnouncement(announcementMsg.trim());
      toast.success("Announcement broadcast to all members.");
      setAnnouncementMsg("");
      setAnnouncementDialogOpen(false);
      loadData();
    } catch {
      toast.error("Failed to broadcast announcement.");
    } finally {
      setPostingAnnouncement(false);
    }
  };

  const approvedMembersCount = stats?.approved_users ?? 0;
  const pendingCount = stats?.pending_approvals ?? pendingUsers.length;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h2 className="text-xl font-bold sm:text-2xl">President's Control Center</h2>
          <p className="text-sm text-muted-foreground">
            Approve members, review activity, and manage resources.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button
            size="sm"
            className="bg-gradient-primary text-primary-foreground w-full sm:w-auto"
            onClick={() => setAnnouncementDialogOpen(true)}
          >
            <Megaphone className="mr-2 h-4 w-4 shrink-0" /> <span>Announcement</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => navigate({ to: "/uploads" })}
          >
            <Upload className="mr-2 h-4 w-4 shrink-0" /> <span>Upload</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => navigate({ to: "/members" })}
          >
            <Users className="mr-2 h-4 w-4 shrink-0" /> <span>Members</span>
          </Button>
        </div>
      </motion.div>

      {/* President Synchronized Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Members"
          value={stats ? `${approvedMembersCount}` : "Loading..."}
          icon={Users}
          hint="Synchronized with Approved"
          variant="primary"
        />
        <StatCard
          label="Pending Approvals"
          value={pendingCount.toString()}
          icon={Clock}
          hint="Awaiting review"
          variant="gold"
          delay={0.05}
        />
        <StatCard
          label="Approved Members"
          value={stats ? `${approvedMembersCount}` : "Loading..."}
          icon={UserCheck}
          hint="Active & Approved"
          variant="success"
          delay={0.1}
        />
        <StatCard
          label="Library Resources"
          value={stats ? `${(stats.document_count || 0) + (stats.music_count || 0)}` : "Loading..."}
          icon={FileText}
          variant="destructive"
          delay={0.15}
        />
      </div>

      {/* Section Breakdown and Recent Activity */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between gap-3 flex-wrap">
            <CardTitle className="text-base">Pending Registrations</CardTitle>
            <Badge variant="secondary">{pendingUsers.length} Pending</Badge>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="hidden sm:table-cell">Phone</TableHead>
                  <TableHead className="hidden sm:table-cell">Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingUsers.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium max-w-[120px] truncate sm:max-w-none">{u.full_name}</TableCell>
                    <TableCell className="text-muted-foreground max-w-[140px] truncate sm:max-w-none">{u.email}</TableCell>
                    <TableCell className="text-muted-foreground hidden sm:table-cell">{u.phone}</TableCell>
                    <TableCell className="text-muted-foreground hidden sm:table-cell">
                      {u.date_joined ? new Date(u.date_joined).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-xs"
                          onClick={() => handleReject(u.id)}
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          className="h-7 px-2 text-xs bg-emerald-600 text-white hover:bg-emerald-700"
                          onClick={() => handleApprove(u.id)}
                        >
                          Approve
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!pendingUsers.length && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-sm text-muted-foreground py-8"
                    >
                      No pending registrations.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">Section breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {hasSectionData ? (
              <div className="space-y-4">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sectionChartData.filter((d) => d.value > 0)}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={3}
                        stroke="oklch(0.99 0 0)"
                        strokeWidth={2}
                      >
                        {sectionChartData
                          .filter((d) => d.value > 0)
                          .map((d) => (
                            <Cell
                              key={d.name}
                              fill={COLORS[d.name as keyof typeof COLORS] ?? "#6366f1"}
                            />
                          ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                  {sectionChartData.map((d) => (
                    <div key={d.name} className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{
                          backgroundColor:
                            COLORS[d.name as keyof typeof COLORS] ?? "#6366f1",
                        }}
                      />
                      <span className="capitalize">{d.name}:</span>
                      <span className="text-muted-foreground">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border/70 bg-muted/50 p-8 text-center text-sm text-muted-foreground">
                No section distribution data available. Assign members to sections.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Shared Member Dashboard Base Information */}
      <div className="border-t border-border/60 pt-6">
        <h3 className="text-lg font-semibold mb-4">Core Member Overview</h3>
        <MemberDashboard />
      </div>

      {/* Post Announcement Dialog */}
      <Dialog open={announcementDialogOpen} onOpenChange={setAnnouncementDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-amber-500" /> Post New Announcement
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <p className="text-sm font-medium mb-1.5">Announcement Message</p>
              <textarea
                value={announcementMsg}
                onChange={(e) => setAnnouncementMsg(e.target.value)}
                placeholder="Write announcement for all choir members..."
                className="w-full min-h-[100px] p-3 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setAnnouncementDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-gradient-primary text-primary-foreground"
              onClick={handleCreateAnnouncement}
              disabled={postingAnnouncement || !announcementMsg.trim()}
            >
              {postingAnnouncement ? "Posting..." : "Broadcast Announcement"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <DashboardFooter />
    </div>
  );
}
