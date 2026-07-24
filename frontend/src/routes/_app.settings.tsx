import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth/context";

export const Route = createFileRoute("/_app/settings")({
  component: SettingsPage,
  ssr: false,
  head: () => ({ meta: [{ title: "Settings — AVC" }] }),
});

function SettingsPage() {
  const { logout } = useAuth();

  const handleDeactivate = () => {
    if (!window.confirm("Are you sure you want to deactivate your account? This action cannot be undone.")) return;
    toast("Account deactivation requested. An administrator will contact you.");
    // In a full implementation this would call an API endpoint, then log out.
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your preferences.</p>
      </div>

      <Card className="shadow-soft">
        <CardHeader><CardTitle className="text-base">Appearance</CardTitle></CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <Label>Theme</Label>
            <p className="text-xs text-muted-foreground">Switch between light and dark mode.</p>
          </div>
          <ThemeToggle />
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader><CardTitle className="text-base">Notifications</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {["Email notifications", "SMS reminders", "Announcement alerts", "Debt updates"].map((l) => (
            <div key={l} className="flex items-center justify-between">
              <Label>{l}</Label>
              <Switch defaultChecked />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="shadow-soft border-destructive/40">
        <CardHeader><CardTitle className="text-base text-destructive">Danger zone</CardTitle></CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleDeactivate}>Deactivate account</Button>
        </CardContent>
      </Card>
    </div>
  );
}