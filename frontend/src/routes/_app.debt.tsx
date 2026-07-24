import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatCard } from "@/components/dashboard/StatCard";
import { Wallet, TrendingDown, CheckCircle2, AlertCircle } from "lucide-react";
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { toast } from "sonner";
import { debtService, type Debt } from "@/lib/api/services/debts";

export const Route = createFileRoute("/_app/debt")({
  component: DebtPage,
  ssr: false,
  head: () => ({ meta: [{ title: "Debt — AVC" }] }),
});

const COLORS = ["oklch(0.65 0.16 155)", "oklch(0.78 0.16 75)", "oklch(0.6 0.22 25)"];

function DebtPage() {
  const [debt, setDebt] = useState<Debt | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    debtService
      .my()
      .then((response) => setDebt(response.data))
      .catch(() => toast.error("Unable to load debt details."))
      .finally(() => setLoading(false));
  }, []);

  const pendingDebt = debt ? Number(debt.total_absence_debt) + Number(debt.total_late_debt) : 0;
  const paidDebt = debt ? Number(debt.total_paid) : 0;
  const chartData = [
    { name: "Paid", value: paidDebt },
    { name: "Late / Pending", value: pendingDebt },
  ];
  const DEBT_COLORS = ["#3b82f6", "#eab308"];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Debt & Contributions</h2>
        <p className="text-sm text-muted-foreground">Track dues, contributions, and clearance status in Turkish Lira (₺).</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Balance" value={debt ? `₺${debt.total_debt.toLocaleString()}` : "Loading..."} icon={Wallet} variant="gold" hint="Turkish Lira (₺)" />
        <StatCard
          label="Paid Amount"
          value={debt ? `₺${debt.total_paid.toLocaleString()}` : "Loading..."}
          icon={CheckCircle2}
          variant="success"
          delay={0.05}
          hint="Turkish Lira (₺)"
        />
        <StatCard label="Pending Debt" value={debt ? `₺${pendingDebt.toLocaleString()}` : "Loading..."} icon={AlertCircle} variant="destructive" delay={0.1} hint="Turkish Lira (₺)" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">Outstanding entries</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount (₺)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {debt?.details.length ? (
                  debt.details.map((detail) => (
                    <TableRow key={detail.id}>
                      <TableCell className="font-medium">{detail.reason}</TableCell>
                      <TableCell className="text-muted-foreground">{new Date(detail.date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right font-medium">₺{detail.amount.toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-sm text-muted-foreground py-8">
                      {loading ? "Loading debt records..." : "No debt records found."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingDown className="h-4 w-4" /> Debt Breakdown (₺)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {paidDebt > 0 || pendingDebt > 0 ? (
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={80}>
                      {chartData.map((_, i) => (
                        <Cell key={i} fill={DEBT_COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val: number) => `₺${val.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="rounded-xl border border-border/70 bg-muted/50 p-8 text-center text-sm text-muted-foreground">
                No debt breakdown available.
              </div>
            )}
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: DEBT_COLORS[0] }} />Paid</span>
                <span>₺{paidDebt.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs font-medium">
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: DEBT_COLORS[1] }} />Late / Pending</span>
                <span>₺{pendingDebt.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

}
