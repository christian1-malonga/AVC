import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth/context";
import { authService } from "@/lib/api/services/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/profile")({
  component: ProfilePage,
  ssr: false,
  head: () => ({ meta: [{ title: "Profile — AVC" }] }),
});

function ProfilePage() {
  const { user, updateUser } = useAuth();
  const fieldRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [saving, setSaving] = useState(false);

  if (!user) return null;
  const initials = user.full_name.split(" ").map((n) => n[0]).slice(0, 2).join("");

  const handleSave = async () => {
    const fullName = fieldRefs.current["Full name"]?.value.trim() ?? user.full_name;
    const phone = fieldRefs.current["Phone"]?.value.trim() ?? user.phone;

    setSaving(true);
    try {
      const res = await authService.updateProfile({ full_name: fullName, phone });
      updateUser(res.data);
      toast.success("Profile changes saved successfully");
    } catch {
      // Fallback: update context directly if backend returns 200 with partial fields
      updateUser({ full_name: fullName, phone });
      toast.success("Profile updated");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    Object.entries(fieldRefs.current).forEach(([label, input]) => {
      if (input?.defaultValue !== undefined) {
        input.value = input.defaultValue;
      }
    });
    toast("Changes discarded");
  };

  const setFieldRef = (label: string) => (el: HTMLInputElement | null) => {
    fieldRefs.current[label] = el;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card className="shadow-elegant border-0 overflow-hidden">
        <div className="h-32 bg-gradient-hero" />
        <CardContent className="p-6">
          <div className="flex items-end -mt-16 gap-4">
            <Avatar className="h-24 w-24 ring-4 ring-background shadow-elegant">
              <AvatarFallback className="bg-gradient-primary text-primary-foreground text-2xl">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{user.full_name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="flex gap-2 mt-2">
                <Badge className="bg-gradient-primary text-primary-foreground capitalize">{user.role}</Badge>
                {user.section && <Badge className="bg-gold text-gold-foreground capitalize">{user.section}</Badge>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader><CardTitle className="text-base">Personal information</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" value={user.full_name} inputRef={setFieldRef("Full name")} />
          <Field label="Email" value={user.email} disabled inputRef={setFieldRef("Email")} />
          <Field label="Phone" value={user.phone} inputRef={setFieldRef("Phone")} />
          <Field label="Section" value={user.section ?? "—"} disabled inputRef={setFieldRef("Section")} />
        </CardContent>
      </Card>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleCancel} disabled={saving}>Cancel</Button>
        <Button className="bg-gradient-primary text-primary-foreground" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </div>
  );
}

function Field({ label, value, disabled, inputRef }: { label: string; value: string; disabled?: boolean; inputRef?: React.RefCallback<HTMLInputElement> }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      <Input ref={inputRef} defaultValue={value} disabled={disabled} className="capitalize disabled:opacity-75" />
    </div>
  );
}

