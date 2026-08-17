export const BASE_URL = "";

type ApiResponse<T> = { data: T; status: number; statusText?: string };

const demoUser = {
  id: "demo-user",
  full_name: "Alex Morgan",
  email: "demo@avc.local",
  phone: "+1 555 0100",
  role: "president",
  section: "soprano",
};

const mockData: Record<string, unknown> = {
  "/analytics/stats/": { total_members: 84, active_members: 76, attendance_rate: 92, total_debt: 1240, monthly_attendance: [ { month: "Jan", attendance: 88 }, { month: "Feb", attendance: 91 }, { month: "Mar", attendance: 94 }, { month: "Apr", attendance: 92 } ] },
  "/auth/roles/": ["member", "president", "secretary", "custodian"],
  "/members/": [ { id: "m-001", full_name: "Alex Morgan", email: "alex@avc.local", section: "soprano", role: "president", status: "active" }, { id: "m-002", full_name: "Jordan Lee", email: "jordan@avc.local", section: "tenor", role: "member", status: "active" }, { id: "m-003", full_name: "Sam Rivera", email: "sam@avc.local", section: "alto", role: "member", status: "active" } ],
  "/notifications/": [ { id: "n-001", title: "Welcome to AVC", message: "Your local demo workspace is ready.", type: "general", read: false, created_at: new Date().toISOString() } ],
  "/music/": [ { id: "song-001", title: "Amazing Grace", composer: "Traditional", category: "Anthem", duration: "04:12" }, { id: "song-002", title: "Be Thou My Vision", composer: "Traditional", category: "Worship", duration: "03:48" } ],
  "/receipts/": [],
  "/voice-notes/": [],
  "/documents/": [],
  "/audit-logs/": [],
  "/debts/my/": { total: 1240, paid: 800, outstanding: 440, details: [] },
  "/choir/attendance/summary/": { attendance_rate: 92, present: 76, absent: 8, excused: 4 },
};

function valueFor(url: string): unknown {
  const key = Object.keys(mockData).find((candidate) => url === candidate || url.startsWith(candidate));
  return key ? mockData[key] : [];
}

function persistUser(user: unknown) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem("avc_user", JSON.stringify(user)); } catch { /* local mock storage is optional */ }
}

async function request<T>(method: string, url: string, data?: unknown): Promise<ApiResponse<T>> {
  if (url.includes("/auth/login/") || url.includes("/auth/register/")) {
    persistUser(demoUser);
    return { data: { user: demoUser, token: "mock-token" } as T, status: 200 };
  }
  if (url.includes("/accounts/profile/")) {
    return { data: { ...demoUser, ...(data as object || {}) } as T, status: 200 };
  }
  if (method === "DELETE") return { data: { detail: "Deleted locally" } as T, status: 200 };
  if (method === "POST" || method === "PATCH" || method === "PUT") return { data: (data ?? { detail: "Saved locally" }) as T, status: 200 };
  return { data: valueFor(url) as T, status: 200 };
}

export const api = {
  get: <T>(url: string, _config?: unknown) => request<T>("GET", url),
  post: <T>(url: string, data?: unknown, _config?: unknown) => request<T>("POST", url, data),
  put: <T>(url: string, data?: unknown, _config?: unknown) => request<T>("PUT", url, data),
  patch: <T>(url: string, data?: unknown, _config?: unknown) => request<T>("PATCH", url, data),
  delete: <T>(url: string, _config?: unknown) => request<T>("DELETE", url),
};

export const MOCK_MODE = true;

