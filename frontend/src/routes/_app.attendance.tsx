import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { attendanceService, type AttendanceRecord } from "@/lib/api/services/attendance";

export const Route = createFileRoute("/_app/attendance")({
  component: AttendancePage,
  ssr: false,
  head: () => ({ meta: [{ title: "Attendance — AVC" }] }),
});

const statusColor: Record<string, string> = {
  PRESENT: "bg-success/20 text-success",
  ABSENT: "bg-destructive/20 text-destructive",
  LATE: "bg-warning/20 text-warning-foreground",
  EXCUSED: "bg-muted text-muted-foreground",
};

function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    attendanceService
      .list()
      .then((res) => {
        if (Array.isArray(res.data)) setRecords(res.data);
        else setRecords([]);
      })
      .catch(() => toast.error("Failed to load attendance records."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Attendance</h2>
        <p className="text-sm text-muted-foreground">Rehearsal attendance records for Thursday & Saturday sessions.</p>
      </div>
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            All records
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Late Fee</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.user_name}</TableCell>
                  <TableCell className="whitespace-nowrap">{new Date(r.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColor[r.status] || ""}>
                      {r.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{r.late_fee ? `₦${r.late_fee}` : "—"}</TableCell>
                </TableRow>
              ))}
              {loading && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              )}
              {!loading && records.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-8">
                    No attendance records yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
