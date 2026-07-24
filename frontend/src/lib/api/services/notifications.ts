import { api } from "../client";

export interface NotificationItem {
  id: string;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export const notificationsService = {
  list: () => api.get<NotificationItem[]>("/notifications/"),
  markRead: (id: string) => api.post(`/notifications/${id}/read/`),
  createAnnouncement: (message: string) => api.post<{ detail: string }>("/notifications/announcements/", { message }),
};

