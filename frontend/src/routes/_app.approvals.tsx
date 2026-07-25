import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { membersService } from "@/lib/api/services/members";
import type { AuthUser } from "@/lib/api/services/auth";

export const Route = createFileRoute("/_app/approvals")({
  component: ApprovalsPage,
  ssr: false,
  head: () => ({ meta: [{ title: "Approvals — AVC" }] }),
});

function ApprovalsPage() {
  const [pending, setPending] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    membersService
      .pendingApprovals()
      .then((response) => setPending(response.data))
      .catch(() => toast.error("Unable to load pending approvals."))
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (id: string, name: string) => {
    setLoading(true);
    try {
      await membersService.approve(id);
      setPending((current) => current.filter((user) => user.id !== id));
      toast.success(`${name} approved`);
    } catch {
      toast.error("Approval failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id: string, name: string) => {
    setLoading(true);
    try {
      await membersService.reject(id);
      setPending((current) => current.filter((user) => user.id !== id));
      toast(`${name} rejected`);
    } catch {
      toast.error("Reject failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Pending Approvals</h2>
        <p className="text-sm text-muted-foreground">Review and approve new choir member registrations.</p>
      </div>
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-base">Registrations awaiting review</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pending.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.full_name}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell className="text-muted-foreground">{u.phone}</TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap">{new Date(u.date_joined).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" disabled={loading} onClick={() => handleReject(u.id, u.full_name)}>
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        className="bg-success text-success-foreground hover:bg-success/90"
                        disabled={loading}
                        onClick={() => handleApprove(u.id, u.full_name)}
                      >
                        Approve
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && pending.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                    No pending approvals at this time.
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
