import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { membersService } from "@/lib/api/services/members";
import type { AuthUser } from "@/lib/api/services/auth";
import type { Role } from "@/lib/api/services/members";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_app/members")({
  component: MembersPage,
  ssr: false,
  head: () => ({ meta: [{ title: "Members — AVC" }] }),
});

function MembersPage() {
  const navigate = useNavigate();
  const [members, setMembers] = useState<AuthUser[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [query, setQuery] = useState("");
  const [editMember, setEditMember] = useState<AuthUser | null>(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [savingRole, setSavingRole] = useState(false);

  const loadMembers = () => {
    membersService
      .list()
      .then((response) => setMembers(response.data))
      .catch(() => toast.error("Unable to load members."));
  };

  const loadRoles = () => {
    membersService
      .listRoles()
      .then((response) => setAvailableRoles(response.data))
      .catch(() => {});
  };

  useEffect(() => {
    loadMembers();
    loadRoles();
  }, []);

  const handleAddMember = () => {
    toast("Use the registration page to add new members.");
  };

  const openRoleDialog = (member: AuthUser) => {
    setEditMember(member);
    setSelectedRole(member.role ?? "member");
    setRoleDialogOpen(true);
  };

  const handleSaveRole = async () => {
    if (!editMember || !selectedRole) return;
    const role = availableRoles.find((r) => r.name.toLowerCase() === selectedRole.toLowerCase());
    if (!role) {
      toast.error("Invalid role selection.");
      return;
    }
    setSavingRole(true);
    try {
      await membersService.updateRole(editMember.id, String(role.id));
      toast.success(`${editMember.full_name} updated to ${selectedRole}.`);
      setMembers((prev) =>
        prev.map((m) =>
          m.id === editMember.id ? { ...m, role: selectedRole as AuthUser["role"] } : m,
        ),
      );
      setRoleDialogOpen(false);
      setEditMember(null);
    } catch {
      toast.error("Failed to update role.");
    } finally {
      setSavingRole(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;
    try {
      await membersService.remove(id);
      toast.success("Member removed.");
      loadMembers();
    } catch {
      toast.error("Failed to remove member.");
    }
  };

  const filtered = members.filter((m) =>
    `${m.full_name} ${m.email}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold">Members</h2>
          <p className="text-sm text-muted-foreground">Manage roles, sections, and access.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="pl-9 w-64"
            />
          </div>
          <Button className="bg-gradient-primary text-primary-foreground" onClick={handleAddMember}>
            Add member
          </Button>
        </div>
      </div>
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-base">All members ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border/70 overflow-x-auto">
            <Table className="min-w-[720px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.full_name}</TableCell>
                    <TableCell className="text-muted-foreground">{m.email}</TableCell>
                    <TableCell className="text-muted-foreground capitalize">
                      {m.section ?? "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          m.role === "president"
                            ? "destructive"
                            : m.role === "secretary" || m.role === "custodian"
                              ? "default"
                              : "secondary"
                        }
                        className="capitalize"
                      >
                        {m.role ?? "member"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          m.is_approved
                            ? "bg-success text-success-foreground"
                            : "bg-warning text-warning-foreground"
                        }
                      >
                        {m.is_approved ? "Approved" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openRoleDialog(m)}
                        disabled={m.role === "president"}
                      >
                        {m.role === "president" ? "Locked" : "Edit"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => handleRemove(m.id)}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!filtered.length && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-sm text-muted-foreground py-8"
                    >
                      No members found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Role Assignment Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Member Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <p className="text-sm font-medium">Member</p>
              <p className="text-sm text-muted-foreground">{editMember?.full_name ?? "—"}</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1.5">Assign Role</p>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="secretary">Secretary</SelectItem>
                  <SelectItem value="custodian">Custodian</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveRole}
              disabled={savingRole || !selectedRole || selectedRole === (editMember?.role ?? "")}
            >
              {savingRole ? "Saving..." : "Save Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
