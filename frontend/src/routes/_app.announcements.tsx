import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Megaphone, Plus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth/context";
import { notificationsService, type NotificationItem } from "@/lib/api/services/notifications";

export const Route = createFileRoute("/_app/announcements")({
  component: AnnouncementsPage,
  ssr: false,
  head: () => ({ meta: [{ title: "Announcements — AVC" }] }),
});

function AnnouncementsPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<NotificationItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canManage = user?.role === "president" || user?.role === "secretary";

  const fetchAnnouncements = () => {
    notificationsService
      .list()
      .then((response) =>
        setAnnouncements(response.data.filter((item) => item.type === "ANNOUNCEMENT")),
      )
      .catch(() => toast.error("Unable to load announcements."));
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handlePost = async () => {
    if (!message.trim()) return;
    setSubmitting(true);
    try {
      await notificationsService.createAnnouncement(message.trim());
      toast.success("Announcement broadcast successfully!");
      setMessage("");
      setDialogOpen(false);
      fetchAnnouncements();
    } catch {
      toast.error("Failed to post announcement.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Announcements</h2>
          <p className="text-sm text-muted-foreground">Notices and announcements from leadership.</p>
        </div>
        {canManage && (
          <Button onClick={() => setDialogOpen(true)} className="bg-gradient-primary text-primary-foreground">
            <Plus className="mr-2 h-4 w-4" /> New Announcement
          </Button>
        )}
      </div>

      {announcements.length === 0 ? (
        <div className="rounded-xl border border-border/70 bg-muted/50 p-8 text-center text-sm text-muted-foreground">
          No announcements available.
        </div>
      ) : (
        announcements.map((a) => (
          <Card key={a.id} className="shadow-soft hover:shadow-elegant transition">
            <CardHeader className="flex flex-row items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-gold text-gold-foreground grid place-items-center shrink-0">
                <Megaphone className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-base">Notice</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">{new Date(a.created_at).toLocaleDateString()}</p>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{a.message}</p>
            </CardContent>
          </Card>
        ))
      )}

      {/* Post Announcement Dialog for President/Secretary */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-amber-500" /> Create Announcement
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <p className="text-sm font-medium mb-1.5">Announcement Content</p>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your announcement for the choir..."
                className="w-full min-h-[120px] p-3 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-gradient-primary text-primary-foreground"
              onClick={handlePost}
              disabled={submitting || !message.trim()}
            >
              {submitting ? "Posting..." : "Broadcast Notice"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
