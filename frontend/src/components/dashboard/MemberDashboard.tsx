import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Users, Music, Wallet, Calendar, Megaphone, FileText, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { StatCard } from "./StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth/context";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { notificationsService, type NotificationItem } from "@/lib/api/services/notifications";
import { documentsService, type DocItem } from "@/lib/api/services/documents";
import { debtService, type Debt } from "@/lib/api/services/debts";
import { attendanceService, type AttendanceSummary } from "@/lib/api/services/attendance";
import { toast } from "sonner";
import { DashboardFooter } from "./DashboardFooter";

export function MemberDashboard() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [documents, setDocuments] = useState<DocItem[]>([]);
  const [debt, setDebt] = useState<Debt | null>(null);
  const [attendance, setAttendance] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      notificationsService.list(),
      documentsService.listAll(),
      debtService.my(),
      attendanceService.my().catch(() => ({ data: { present_count: 0, absent_count: 0, total_sessions: 0, percentage: 100, history: [] } })),
    ])
      .then(([notificationsResponse, documentsResponse, debtResponse, attendanceResponse]) => {
        setNotifications(notificationsResponse.data);
        setDocuments(documentsResponse.data);
        setDebt(debtResponse.data);
        if (attendanceResponse?.data) {
          setAttendance(attendanceResponse.data);
        }
      })
      .catch((error) => {
        if (error?.response?.status !== 404) {
          toast.error("Unable to load member dashboard data.");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const announcementItems = notifications.filter((item) => item.type === "ANNOUNCEMENT");
  const latestDocuments = documents.slice(0, 3);

  // Attendance Chart Data: Blue = Present (#3b82f6), Red = Absent (#ef4444)
  const attendanceChartData = [
    { name: "Present", value: attendance ? attendance.present_count : 0 },
    { name: "Absent", value: attendance ? attendance.absent_count : 0 },
  ];
  const hasAttendanceData = (attendance?.total_sessions ?? 0) > 0;
  const ATTENDANCE_COLORS = ["#3b82f6", "#ef4444"];

  // Debt Chart Data: Blue = Paid (#3b82f6), Yellow = Late / Pending (#eab308)
  const pendingDebt = debt ? Number(debt.total_absence_debt) + Number(debt.total_late_debt) : 0;
  const paidDebt = debt ? Number(debt.total_paid) : 0;
  const debtChartData = [
    { name: "Paid", value: paidDebt },
    { name: "Late / Pending", value: pendingDebt },
  ];
  const hasDebtData = paidDebt > 0 || pendingDebt > 0;
  const DEBT_PIE_COLORS = ["#3b82f6", "#eab308"];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col gap-4 border-b border-border pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Member overview
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
              {user?.full_name}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Section{" "}
              <span className="font-medium capitalize text-foreground">{user?.section ?? "Not assigned"}</span> ·
              Status Approved
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="rounded-sm font-normal">
              Approved
            </Badge>
            {user?.section && (
              <Badge variant="outline" className="rounded-sm font-normal capitalize">
                {user.section}
              </Badge>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Attendance Rate"
          value={attendance ? `${attendance.percentage}%` : loading ? "Loading..." : "100%"}
          icon={Users}
          hint={attendance?.total_sessions ? `${attendance.present_count}/${attendance.total_sessions} sessions` : "No sessions recorded"}
          variant="primary"
        />
        <StatCard
          label="Outstanding Debt"
          value={
            debt ? `₺${debt.total_debt.toLocaleString()}` : loading ? "Loading..." : "₺0"
          }
          icon={Wallet}
          hint="Turkish Lira (₺)"
          variant={debt && Number(debt.total_debt) > 0 ? "destructive" : "success"}
          delay={0.05}
        />
        <StatCard
          label="Library items"
          value={`${documents.length}`}
          icon={Music}
          hint="Documents available"
          delay={0.1}
        />
        <StatCard
          label="Next Rehearsal"
          value="Sat"
          icon={Calendar}
          hint="4:00 PM · Main Sanctuary"
          variant="gold"
          delay={0.15}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Attendance Pie Chart Card */}
        <Card className="shadow-soft flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> Attendance
            </CardTitle>
            <Badge variant="secondary">
              {attendance?.total_sessions ?? 0} Sessions
            </Badge>
          </CardHeader>
          <CardContent className="pt-2">
            {hasAttendanceData ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={attendanceChartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                      stroke="oklch(0.99 0 0)"
                      strokeWidth={2}
                    >
                      {attendanceChartData.map((_, i) => (
                        <Cell key={i} fill={ATTENDANCE_COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-border/70 bg-muted/40 p-4 text-center text-sm text-muted-foreground">
                <Users className="mb-2 h-8 w-8 opacity-40 text-primary" />
                <p>No attendance records logged yet.</p>
              </div>
            )}
            <div className="mt-4 flex justify-center gap-6 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: ATTENDANCE_COLORS[0] }} />
                <span>Present ({attendance?.present_count ?? 0})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: ATTENDANCE_COLORS[1] }} />
                <span>Absent ({attendance?.absent_count ?? 0})</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Debt Overview Pie Chart Card */}
        <Card className="shadow-soft flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Wallet className="h-4 w-4 text-amber-500" /> Debt Overview
            </CardTitle>
            <Badge variant="outline" className="text-xs">Turkish Lira (₺)</Badge>
          </CardHeader>
          <CardContent className="pt-2">
            {hasDebtData ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={debtChartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                      stroke="oklch(0.99 0 0)"
                      strokeWidth={2}
                    >
                      {debtChartData.map((_, i) => (
                        <Cell key={i} fill={DEBT_PIE_COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val: number) => `₺${val.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-border/70 bg-muted/40 p-4 text-center text-sm text-muted-foreground">
                <CheckCircle2 className="mb-2 h-8 w-8 opacity-40 text-emerald-500" />
                <p>No active debt records found.</p>
              </div>
            )}
            <div className="mt-4 flex justify-center gap-6 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: DEBT_PIE_COLORS[0] }} />
                <span>Paid (₺{paidDebt.toLocaleString()})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: DEBT_PIE_COLORS[1] }} />
                <span>Late / Pending (₺{pendingDebt.toLocaleString()})</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Announcements */}
        <Card className="shadow-soft flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-amber-500" /> Announcements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            {announcementItems.length === 0 ? (
              <div className="flex h-48 items-center justify-center rounded-xl border border-border/70 bg-muted/40 p-4 text-center text-sm text-muted-foreground">
                No announcements yet.
              </div>
            ) : (
              announcementItems.slice(0, 3).map((a) => (
                <div
                  key={a.id}
                  className="p-3 rounded-lg bg-muted/40 border border-border/50 hover:bg-muted transition"
                >
                  <p className="text-sm font-medium">Notice</p>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{a.message}</p>
                  <p className="text-[10px] text-muted-foreground/70 mt-1">
                    {new Date(a.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Latest Documents */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-secondary" /> Latest Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {latestDocuments.length === 0 ? (
              <div className="rounded-xl border border-border/70 bg-muted/50 p-6 text-sm text-muted-foreground">
                No documents uploaded yet.
              </div>
            ) : (
              latestDocuments.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-muted transition"
                >
                  <div className="h-9 w-9 rounded bg-secondary/10 text-secondary grid place-items-center">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{d.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {d.category} · {new Date(d.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Upcoming Rehearsal & Events */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" /> Next Rehearsal & Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 rounded-lg border border-primary/20 bg-primary/5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase text-primary">Next Rehearsal</span>
                  <Badge variant="outline" className="text-[10px]">Upcoming</Badge>
                </div>
                <p className="mt-1 text-sm font-medium">Saturday Rehearsal</p>
                <p className="text-xs text-muted-foreground">Saturday at 4:00 PM · Main Sanctuary</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {notifications.length === 0 ? (
              <div className="rounded-xl border border-border/70 bg-muted/50 p-6 text-sm text-muted-foreground">
                No notifications yet.
              </div>
            ) : (
              notifications.slice(0, 4).map((n) => (
                <div
                  key={n.id}
                  className="flex flex-col gap-1 rounded-md p-2 transition hover:bg-muted sm:flex-row sm:items-start sm:gap-3"
                >
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.is_read ? "bg-muted-foreground/30" : "bg-secondary"}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{n.type}</p>
                    <p className="text-xs text-muted-foreground">{n.message}</p>
                  </div>
                  <span className="self-start whitespace-nowrap text-[10px] text-muted-foreground">
                    {new Date(n.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
      <DashboardFooter />
    </div>
  );
}
