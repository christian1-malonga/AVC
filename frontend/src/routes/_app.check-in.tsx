import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Fingerprint, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/check-in")({
  component: CheckInPage,
  ssr: false,
  head: () => ({ meta: [{ title: "Check-in — AVC" }] }),
});

function CheckInPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return toast.error("Please enter a session code.");
    setLoading(true);
    try {
      const res = await fetch("/choir/attendance/check-in/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("avc_token")}`,
        },
        body: JSON.stringify({ code: code.trim() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Check-in failed.");
      }
      toast.success("Checked in successfully!");
      setCode("");
    } catch (err: any) {
      toast.error(err.message || "Unable to check in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Check-in</h2>
        <p className="text-sm text-muted-foreground">Self-check into rehearsal using a session code.</p>
      </div>
      <Card className="max-w-md shadow-soft">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Fingerprint className="h-4 w-4" />
            Enter session code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCheckIn} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="code" className="text-xs font-medium">Session code</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. THU-0727"
                className="h-10"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Check in
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
