import { motion } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import { Users, Calendar, CheckCircle, XCircle, Clock, Upload } from "lucide-react";
import { StatCard } from "./StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { attendanceService } from "@/lib/api/services/attendance";
import { membersService } from "@/lib/api/services/members";
import type { AuthUser } from "@/lib/api/services/auth";

interface AttendanceSummary {
  present_count: number;
  absent_count: number;
  late_count: number;
  total_sessions: number;
  percentage: number;
}

interface MarkRecord {
  user_id: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  late_fee?: number;
}

export function ProvostDashboard() {
  const [members, setMembers] = useState<AuthUser[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [lateFees, setLateFees] = useState<Record<string, string>>({});
  const [marking, setMarking] = useState<Record<string, "PRESENT" | "ABSENT" | "LATE" | "EXCUSED">>({});
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [membersRes, attRes] = await Promise.all([
        membersService.list({ status: "approved" }),
        attendanceService.my(),
      ]);
      setMembers(membersRes.data);
      setSummary(attRes.data);
    } catch {
      toast.error("Failed to load data.");
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const toggleStatus = (userId: string, status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED") => {
    setMarking((prev) => {
      const next = { ...prev };
      if (next[userId] === status) {
        delete next[userId];
      } else {
        next[userId] = status;
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    const userIds = Object.keys(marking);
    if (userIds.length === 0) {
      toast.error("Select at least one member to mark.");
      return;
    }

    setSubmitting(true);
    try {
      const records: MarkRecord[] = userIds.map((uid) => ({
        user_id: uid,
        status: marking[uid],
        ...(marking[uid] === "LATE" ? { late_fee: parseFloat(lateFees[uid] || "10") } : {}),
      }));

      await attendanceService.mark(date, records);
      toast.success(`Attendance marked for ${records.length} members.`);
      setMarking({});
      setLateFees({});
      loadData();
    } catch {
      toast.error("Failed to mark attendance.");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "PRESENT": return "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "ABSENT": return "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400";
      case "LATE": return "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400";
      case "EXCUSED": return "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400";
      default: return "";
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-bold sm:text-2xl">Provost Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Manage rehearsal attendance and debtor lists.
        </p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Sessions" value={summary?.total_sessions?.toString() || "0"} icon={Calendar} variant="primary" />
        <StatCard label="Present Rate" value={summary ? `${summary.percentage}%` : "0%"} icon={CheckCircle} variant="success" delay={0.05} />
        <StatCard label="Late Count" value={summary?.late_count?.toString() || "0"} icon={Clock} variant="gold" delay={0.1} />
        <StatCard label="Total Members" value={members.length.toString()} icon={Users} delay={0.15} />
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Mark Attendance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <Label htmlFor="att-date" className="text-xs">Rehearsal Date</Label>
              <Input id="att-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-44" />
            </div>
            <div className="flex gap-2 ml-auto">
              <Button size="sm" variant="outline" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Saving..." : `Submit (${Object.keys(marking).length})`}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setMarking({}); setLateFees({}); }}>
                Clear
              </Button>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {(["PRESENT", "ABSENT", "LATE", "EXCUSED"] as const).map((s) => (
              <Badge key={s} variant="outline" className={getStatusColor(s)}>
                Click name then <span className="font-bold mx-1">{s}</span> to mark
              </Badge>
            ))}
          </div>

          <div className="overflow-x-auto max-h-[400px] overflow-y-auto border rounded-lg">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead className="text-center">Present</TableHead>
                  <TableHead className="text-center">Absent</TableHead>
                  <TableHead className="text-center">Late</TableHead>
                  <TableHead className="text-center">Excused</TableHead>
                  <TableHead className="text-right">Late Fee (₦)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((m) => {
                  const status = marking[m.id];
                  return (
                    <TableRow key={m.id} className={status ? "bg-muted/30" : ""}>
                      <TableCell className="font-medium">{m.full_name}</TableCell>
                      <TableCell className="text-muted-foreground capitalize">{m.section || "—"}</TableCell>
                      {(["PRESENT", "ABSENT", "LATE", "EXCUSED"] as const).map((s) => (
                        <TableCell key={s} className="text-center">
                          <button
                            type="button"
                            className={`inline-flex items-center justify-center h-7 w-7 rounded-full border transition-colors ${
                              status === s
                                ? getStatusColor(s) + " border-current"
                                : "border-border hover:border-muted-foreground/40"
                            }`}
                            onClick={() => toggleStatus(m.id, s)}
                            title={`Mark ${s}`}
                          >
                            {s === "PRESENT" && <CheckCircle className="h-3.5 w-3.5" />}
                            {s === "ABSENT" && <XCircle className="h-3.5 w-3.5" />}
                            {s === "LATE" && <Clock className="h-3.5 w-3.5" />}
                            {s === "EXCUSED" && <span className="text-[10px] font-bold">E</span>}
                          </button>
                        </TableCell>
                      ))}
                      <TableCell className="text-right">
                        {marking[m.id] === "LATE" ? (
                          <Input
                            type="number"
                            className="h-7 w-20 text-xs text-right ml-auto"
                            placeholder="10"
                            value={lateFees[m.id] || ""}
                            onChange={(e) => setLateFees((p) => ({ ...p, [m.id]: e.target.value }))}
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Upload className="h-4 w-4 text-primary" />
            Bulk Upload Debtor List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Upload a CSV file with columns: <code>email</code>, <code>amount</code>, <code>reason</code> (optional).
          </p>
          <input
            type="file"
            accept=".csv"
            className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const form = new FormData();
              form.append("file", file);
              try {
                const res = await fetch("/debts/bulk/", { method: "POST", headers: { Authorization: `Bearer ${localStorage.getItem("avc_token")}` }, body: form });
                const data = await res.json();
                if (res.ok) toast.success(data.data?.detail || "Imported.");
                else toast.error(data.detail || "Import failed.");
              } catch {
                toast.error("Upload failed.");
              }
              e.target.value = "";
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
