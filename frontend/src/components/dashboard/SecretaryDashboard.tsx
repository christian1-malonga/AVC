import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, Wallet, CheckCircle2, UserCheck, DollarSign, File as FileIcon, Calendar } from "lucide-react";
import { StatCard } from "./StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { DashboardFooter } from "./DashboardFooter";
import { documentsService, DocItem } from "@/lib/api/services/documents";
import { membersService } from "@/lib/api/services/members";
import { attendanceService } from "@/lib/api/services/attendance";
import { debtService } from "@/lib/api/services/debts";
import { MemberDashboard } from "./MemberDashboard";
import type { AuthUser } from "@/lib/api/services/auth";

export function SecretaryDashboard() {
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [documents, setDocuments] = useState<DocItem[]>([]);
  const [members, setMembers] = useState<AuthUser[]>([]);

  // Attendance marking state
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
  const [selectedUserForAtt, setSelectedUserForAtt] = useState<string>("");
  const [attStatus, setAttStatus] = useState<"PRESENT" | "ABSENT">("PRESENT");
  const [attDate, setAttDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [savingAttendance, setSavingAttendance] = useState(false);

  // Debt update state
  const [debtDialogOpen, setDebtDialogOpen] = useState(false);
  const [selectedUserForDebt, setSelectedUserForDebt] = useState<string>("");
  const [paidVal, setPaidVal] = useState<string>("0");
  const [lateVal, setLateVal] = useState<string>("0");
  const [absenceVal, setAbsenceVal] = useState<string>("0");
  const [savingDebt, setSavingDebt] = useState(false);

  const loadDocs = () => {
    documentsService
      .listAll()
      .then((response) => setDocuments(response.data))
      .catch(() => toast.error("Unable to load documents."));
  };

  useEffect(() => {
    loadDocs();
    membersService.list().then((res) => setMembers(res.data)).catch(() => {});
  }, []);

  const debtRecordsCount = documents.filter((doc) => doc.category === "debt").length;

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    setFiles((f) => [...dropped, ...f]);
    toast.success(`${dropped.length} file(s) added`);
  }

  const handleSaveAttendance = async () => {
    if (!selectedUserForAtt) return;
    setSavingAttendance(true);
    try {
      await attendanceService.mark({
        date: attDate,
        user_id: Number(selectedUserForAtt),
        status: attStatus,
      });
      toast.success("Member attendance recorded successfully.");
      setAttendanceDialogOpen(false);
      setSelectedUserForAtt("");
    } catch {
      toast.error("Failed to record attendance.");
    } finally {
      setSavingAttendance(false);
    }
  };

  const handleSaveDebt = async () => {
    if (!selectedUserForDebt) return;
    setSavingDebt(true);
    try {
      await debtService.update(selectedUserForDebt, {
        total_paid: Number(paidVal) || 0,
        total_late_debt: Number(lateVal) || 0,
        total_absence_debt: Number(absenceVal) || 0,
      });
      toast.success("Member debt status updated in Turkish Lira (₺).");
      setDebtDialogOpen(false);
      setSelectedUserForDebt("");
    } catch {
      toast.error("Failed to update debt.");
    } finally {
      setSavingDebt(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h2 className="text-xl font-bold sm:text-2xl">Secretary Desk</h2>
          <p className="text-sm text-muted-foreground">
            Manage choir records, document uploads, member attendance, and debt status.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            className="bg-gradient-primary text-primary-foreground"
            onClick={() => setAttendanceDialogOpen(true)}
          >
            <UserCheck className="mr-2 h-4 w-4" /> Mark Attendance
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setDebtDialogOpen(true)}
          >
            <Wallet className="mr-2 h-4 w-4" /> Update Member Debt
          </Button>
        </div>
      </motion.div>

      {/* Secretary Stat Cards (Removed "This Month" card per request) */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Uploads"
          value={`${documents.length}`}
          icon={Upload}
          variant="primary"
        />
        <StatCard
          label="Debt Statements"
          value={`${debtRecordsCount}`}
          icon={Wallet}
          hint="Turkish Lira (₺)"
          delay={0.05}
        />
        <StatCard
          label="Document System"
          value="Active"
          icon={CheckCircle2}
          variant="success"
          delay={0.1}
        />
      </div>

      {/* Document Upload Area */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-base">Upload documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`rounded-xl border-2 border-dashed p-5 text-center transition sm:p-8 ${
              dragging ? "border-secondary bg-secondary/5" : "border-border"
            }`}
          >
            <div className="mx-auto h-12 w-12 rounded-full bg-gradient-primary text-primary-foreground grid place-items-center shadow-elegant">
              <Upload className="h-5 w-5" />
            </div>
            <p className="mt-3 font-semibold text-sm sm:text-base">Drag & drop files here</p>
            <p className="text-xs text-muted-foreground mt-1">
              or click to browse (PDF, DOCX, XLSX)
            </p>
          </div>

          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              {files.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border/60"
                >
                  <div className="h-9 w-9 rounded bg-secondary/10 text-secondary grid place-items-center">
                    <FileIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{f.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(f.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Badge variant="secondary">Ready</Badge>
                </div>
              ))}
              <Button className="w-full bg-gradient-primary text-primary-foreground">
                Upload all
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload History */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-base">Upload history</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead className="text-right">Size</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.title}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {d.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(d.uploaded_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {d.size ? `${Math.round(d.size / 1024)} KB` : "—"}
                  </TableCell>
                </TableRow>
              ))}
              {!documents.length && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-8">
                    No documents found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Core Member Dashboard Information */}
      <div className="border-t border-border/60 pt-6">
        <h3 className="text-lg font-semibold mb-4">Core Member Overview</h3>
        <MemberDashboard />
      </div>

      {/* Attendance Dialog */}
      <Dialog open={attendanceDialogOpen} onOpenChange={setAttendanceDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" /> Mark Member Attendance
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <p className="text-sm font-medium mb-1.5">Date</p>
              <Input
                type="date"
                value={attDate}
                onChange={(e) => setAttDate(e.target.value)}
              />
            </div>
            <div>
              <p className="text-sm font-medium mb-1.5">Select Member</p>
              <Select value={selectedUserForAtt} onValueChange={setSelectedUserForAtt}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a member" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={String(m.id)}>
                      {m.full_name} ({m.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-sm font-medium mb-1.5">Status</p>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant={attStatus === "PRESENT" ? "default" : "outline"}
                  className={attStatus === "PRESENT" ? "bg-blue-600 text-white flex-1" : "flex-1"}
                  onClick={() => setAttStatus("PRESENT")}
                >
                  Present (Blue)
                </Button>
                <Button
                  type="button"
                  variant={attStatus === "ABSENT" ? "default" : "outline"}
                  className={attStatus === "ABSENT" ? "bg-red-600 text-white flex-1" : "flex-1"}
                  onClick={() => setAttStatus("ABSENT")}
                >
                  Absent (Red)
                </Button>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setAttendanceDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-gradient-primary text-primary-foreground"
              onClick={handleSaveAttendance}
              disabled={savingAttendance || !selectedUserForAtt}
            >
              {savingAttendance ? "Saving..." : "Save Record"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Debt Update Dialog */}
      <Dialog open={debtDialogOpen} onOpenChange={setDebtDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-amber-500" /> Update Member Debt (₺)
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <p className="text-sm font-medium mb-1.5">Select Member</p>
              <Select value={selectedUserForDebt} onValueChange={setSelectedUserForDebt}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a member" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={String(m.id)}>
                      {m.full_name} ({m.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-medium mb-1">Paid Amount (₺)</p>
                <Input
                  type="number"
                  value={paidVal}
                  onChange={(e) => setPaidVal(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <p className="text-xs font-medium mb-1">Absence Debt (₺)</p>
                <Input
                  type="number"
                  value={absenceVal}
                  onChange={(e) => setAbsenceVal(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="col-span-2">
                <p className="text-xs font-medium mb-1">Late Debt (₺)</p>
                <Input
                  type="number"
                  value={lateVal}
                  onChange={(e) => setLateVal(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDebtDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-gradient-primary text-primary-foreground"
              onClick={handleSaveDebt}
              disabled={savingDebt || !selectedUserForDebt}
            >
              {savingDebt ? "Saving..." : "Save Debt Record"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <DashboardFooter />
    </div>
  );
}
