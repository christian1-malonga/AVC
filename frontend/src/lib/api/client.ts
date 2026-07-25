import { findMockUser, createMockUser, MOCK_MEMBERS, MOCK_ROLES, MOCK_DEBTS, MOCK_ATTENDANCE, MOCK_DOCUMENTS, MOCK_SONGS, MOCK_NOTIFICATIONS, getMyAttendance, getMyDebts, MOCK_STATS } from "@/lib/mock/data";
import type { AuthUser, LoginPayload } from "./services/auth";
import type { Debt } from "./services/debts";

function delay(ms = 200): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function ok<T>(data: T) {
  return Promise.resolve({ data, status: 200, statusText: "OK", headers: {}, config: {} }) as any;
}

export const api = {
  get: async (url: string, _config?: any) => {
    await delay();
    if (url === "/auth/me/") {
      const raw = localStorage.getItem("avc_user");
      const user = raw ? (JSON.parse(raw) as AuthUser) : MOCK_MEMBERS[0];
      return ok(user);
    }
    if (url === "/auth/users/" || url.startsWith("/auth/users?")) return ok(MOCK_MEMBERS);
    if (url === "/auth/approvals/pending/") return ok(MOCK_MEMBERS.filter((m) => !m.approved));
    if (url === "/auth/roles/") return ok(MOCK_ROLES);
    if (url === "/analytics/stats/") return ok(MOCK_STATS);
    if (url === "/debts/my/") {
      const raw = localStorage.getItem("avc_user");
      const user = raw ? (JSON.parse(raw) as AuthUser) : null;
      const debt = user ? getMyDebts(user.email) : MOCK_DEBTS[0];
      if (!debt) return Promise.reject(Object.assign(new Error("Not found"), { response: { status: 404 } }));
      return ok(debt);
    }
    if (url === "/debts/list/") return ok(MOCK_DEBTS);
    if (url === "/choir/attendance/my/") {
      const raw = localStorage.getItem("avc_user");
      const user = raw ? (JSON.parse(raw) as AuthUser) : null;
      return ok(user ? getMyAttendance(user.email) : getMyAttendance("member@avc.com"));
    }
    if (url === "/choir/attendance/") return ok(MOCK_ATTENDANCE);
    if (url.startsWith("/documents")) return ok(MOCK_DOCUMENTS);
    if (url.startsWith("/music")) {
      const params = new URLSearchParams(_config?.params);
      let songs = MOCK_SONGS;
      const q = _config?.params?.q;
      const cat = _config?.params?.category;
      if (q) songs = songs.filter((s) => s.title.toLowerCase().includes(q.toLowerCase()));
      if (cat) songs = songs.filter((s) => s.category === cat);
      return ok(songs);
    }
    if (url.startsWith("/notifications")) return ok(MOCK_NOTIFICATIONS);
    return ok({});
  },

  post: async (url: string, data?: any, _config?: any) => {
    await delay();
    if (url === "/auth/login/") {
      const d = data as LoginPayload;
      let user = findMockUser(d.email);
      if (!user) user = createMockUser(d.email);
      return ok({ token: "mock-token-123", user });
    }
    if (url === "/auth/register/") {
      return ok({ user: { id: String(Date.now()), full_name: `${data.first_name} ${data.last_name}`, email: data.email, phone: data.phone, role: "member", date_joined: new Date().toISOString(), approved: true, is_approved: true } });
    }
    if (url === "/auth/logout/") return ok({});
    if (url === "/auth/section/") return ok({ detail: "Section selected successfully.", section: data?.section });
    if (url.startsWith("/auth/approvals/") && url.endsWith("/approve/")) return ok({ detail: "User approved." });
    if (url.startsWith("/auth/approvals/") && url.endsWith("/reject/")) return ok({ detail: "User rejected." });
    if (url.startsWith("/auth/users/") && url.endsWith("/role/")) return ok({ detail: "Role updated." });
    if (url === "/choir/attendance/") return ok({ detail: "Attendance marked." });
    if (url === "/notifications/announcements/") return ok({ detail: "Announcement sent." });
    if (url.startsWith("/notifications/") && url.endsWith("/read/")) return ok({ detail: "Notification marked as read." });
    if (url.startsWith("/debts/user/")) {
      const debt = MOCK_DEBTS[0] ? { ...MOCK_DEBTS[0], ...data } : data;
      return ok(debt);
    }
    if (url.startsWith("/documents")) return ok({ id: "new", title: "New Document", category: "general", file: "", uploaded_by_name: "You", uploaded_at: new Date().toISOString() });
    if (url.startsWith("/music")) return ok({ id: "new", title: "New Song", category: "hymn", upload_date: new Date().toISOString().split("T")[0] });
    return ok({});
  },

  patch: async (url: string, data?: any) => {
    await delay();
    return ok(data || {});
  },

  delete: async (url: string) => {
    await delay();
    return ok({ detail: "Deleted." });
  },
};
