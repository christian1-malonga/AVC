import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { toast } from "sonner";
import { notificationsService, type NotificationItem } from "@/lib/api/services/notifications";

export const Route = createFileRoute("/_app/notifications")({
  component: NotificationsPage,
  ssr: false,
  head: () => ({ meta: [{ title: "Notifications — AVC" }] }),
});

function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadNotifications = () => {
    setLoading(true);
    notificationsService
      .list()
      .then((response) => setNotifications(response.data))
      .catch(() => toast.error("Unable to load notifications."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.is_read);
    if (unread.length === 0) {
      toast("No unread notifications.");
      return;
    }

    try {
      await Promise.all(unread.map((n) => notificationsService.markRead(n.id)));
      toast.success("All notifications marked as read.");
      loadNotifications();
    } catch {
      toast.error("Failed to mark some notifications as read.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Notifications</h2>
          <p className="text-sm text-muted-foreground">Latest updates from the choir.</p>
        </div>
        <Button variant="outline" size="sm" disabled={loading} onClick={handleMarkAllRead}>
          Mark all read
        </Button>
      </div>
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4" /> Inbox
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No notifications available.</div>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="py-3 flex items-start gap-3">
                <span className={`h-2 w-2 rounded-full mt-2 ${n.is_read ? "bg-muted-foreground/30" : "bg-secondary"}`} />
                <div className="flex-1">
                  <p className="font-medium text-sm">{n.type}</p>
                  <p className="text-xs text-muted-foreground">{n.message}</p>
                </div>
                <span className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleDateString()}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}