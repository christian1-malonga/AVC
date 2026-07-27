import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Receipt, Download } from "lucide-react";
import { toast } from "sonner";
import { receiptsService, type Receipt as ReceiptItem } from "@/lib/api/services/receipts";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/receipts")({
  component: ReceiptsPage,
  ssr: false,
  head: () => ({ meta: [{ title: "Receipts — AVC" }] }),
});

function ReceiptsPage() {
  const [receipts, setReceipts] = useState<ReceiptItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    receiptsService
      .list()
      .then((res) => setReceipts(res.data))
      .catch(() => toast.error("Failed to load receipts."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Receipts</h2>
        <p className="text-sm text-muted-foreground">Payment receipts and financial records.</p>
      </div>
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Payment receipts
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receipts.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.title}</TableCell>
                  <TableCell>{r.user_name || "—"}</TableCell>
                  <TableCell>₦{r.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {new Date(r.uploaded_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {r.file_path ? (
                      <Button size="sm" variant="outline" asChild>
                        <a href={r.file_path} target="_blank" rel="noreferrer">
                          <Download className="h-3 w-3 mr-1" /> View
                        </a>
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">No file</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {!loading && receipts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                    No receipts yet.
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
