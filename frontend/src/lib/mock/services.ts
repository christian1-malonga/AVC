import { findMockUser, createMockUser, MOCK_MEMBERS, MOCK_ROLES, MOCK_DEBTS, MOCK_ATTENDANCE, MOCK_DOCUMENTS, MOCK_SONGS, MOCK_NOTIFICATIONS, getMyAttendance, getMyDebts, MOCK_STATS } from "@/lib/mock/data";
import type { AuthUser, LoginPayload, RegisterPayload } from "./auth";
import type { Role } from "./members";
import type { Debt } from "./debts";
import type { AttendanceRecord, AttendanceSummary } from "./attendance";
import type { DocItem } from "./documents";
import type { Song } from "./music";
import type { NotificationItem } from "./notifications";

function delay(ms = 300): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export const authService = {
  register: async (data: RegisterPayload) => {
    await delay();
    const user: AuthUser = {
      id: String(Date.now()),
      full_name: `${data.first_name} ${data.last_name}`,
      email: data.email,
      phone: data.phone,
      role: "member",
      date_joined: new Date().toISOString(),
      approved: false,
      is_approved: false,
    };
    return { data: { user } } as any;
  },

  login: async (data: LoginPayload) => {
    await delay();
    let user = findMockUser(data.email);
    if (!user) {
      user = createMockUser(data.email);
    }
    return {
      data: {
        token: "mock-token-123",
        user,
      },
    } as any;
  },

  me: async () => {
    await delay();
    const raw = localStorage.getItem("avc_user");
    const user = raw ? (JSON.parse(raw) as AuthUser) : Object.values(findMockUser)[0];
    return { data: user } as any;
  },

  logout: async () => {
    await delay();
    return { data: {} } as any;
  },

  setSection: async (section: string) => {
    await delay();
    return { data: { detail: "Section selected successfully.", section } } as any;
  },

  updateProfile: async (data: { full_name?: string; phone?: string; section?: string }) => {
    await delay();
    return { data: data } as any;
  },
};

export const membersService = {
  list: async () => {
    await delay();
    return { data: MOCK_MEMBERS } as any;
  },
  pendingApprovals: async () => {
    await delay();
    return { data: MOCK_MEMBERS.filter((m) => !m.approved) } as any;
  },
  approve: async (id: string) => {
    await delay();
    return { data: { detail: "User approved." } } as any;
  },
  reject: async (id: string) => {
    await delay();
    return { data: { detail: "User rejected." } } as any;
  },
  updateRole: async (id: string, roleId: string) => {
    await delay();
    return { data: { detail: "Role updated." } } as any;
  },
  remove: async (id: string) => {
    await delay();
    return { data: { detail: "User removed." } } as any;
  },
  listRoles: async () => {
    await delay();
    return { data: MOCK_ROLES } as any;
  },
};

export const debtService = {
  my: async () => {
    await delay();
    const raw = localStorage.getItem("avc_user");
    const user = raw ? (JSON.parse(raw) as AuthUser) : null;
    const debt = user ? getMyDebts(user.email) : MOCK_DEBTS[0];
    if (!debt) {
      const err = new Error("Not found") as any;
      err.response = { status: 404 };
      throw err;
    }
    return { data: debt } as any;
  },
  list: async () => {
    await delay();
    return { data: MOCK_DEBTS } as any;
  },
  update: async (userId: number | string, data: any) => {
    await delay();
    return { data: { ...MOCK_DEBTS[0], ...data } } as any;
  },
};

export const attendanceService = {
  my: async () => {
    await delay();
    const raw = localStorage.getItem("avc_user");
    const user = raw ? (JSON.parse(raw) as AuthUser) : null;
    const summary = user ? getMyAttendance(user.email) : getMyAttendance("member@avc.com");
    return { data: summary } as any;
  },
  list: async () => {
    await delay();
    return { data: MOCK_ATTENDANCE } as any;
  },
  mark: async (data: any) => {
    await delay();
    return { data: { detail: "Attendance marked." } } as any;
  },
};

export const documentsService = {
  listAll: async () => {
    await delay();
    return { data: MOCK_DOCUMENTS } as any;
  },
  listMeeting: async () => {
    await delay();
    return { data: MOCK_DOCUMENTS.filter((d) => d.category === "minutes") } as any;
  },
  listGeneral: async () => {
    await delay();
    return { data: MOCK_DOCUMENTS.filter((d) => d.category !== "minutes") } as any;
  },
  uploadMeeting: async (formData: FormData) => {
    await delay();
    return { data: { id: "new", title: "New Meeting", category: "minutes", file: "", uploaded_by_name: "You", uploaded_at: new Date().toISOString() } } as any;
  },
  uploadGeneral: async (formData: FormData) => {
    await delay();
    return { data: { id: "new", title: "New Document", category: "general", file: "", uploaded_by_name: "You", uploaded_at: new Date().toISOString() } } as any;
  },
  remove: async (id: string) => {
    await delay();
    return { data: { detail: "Document removed." } } as any;
  },
};

export const musicService = {
  list: async (params?: any) => {
    await delay();
    let songs = MOCK_SONGS;
    if (params?.q) {
      songs = songs.filter((s) => s.title.toLowerCase().includes(params.q.toLowerCase()));
    }
    if (params?.category) {
      songs = songs.filter((s) => s.category === params.category);
    }
    return { data: songs } as any;
  },
  get: async (id: string) => {
    await delay();
    const song = MOCK_SONGS.find((s) => s.id === id);
    return { data: song } as any;
  },
  upload: async (formData: FormData) => {
    await delay();
    return { data: { id: "new", title: "New Song", category: "hymn", upload_date: new Date().toISOString().split("T")[0] } } as any;
  },
  remove: async (id: string) => {
    await delay();
    return { data: { detail: "Song removed." } } as any;
  },
};

export const notificationsService = {
  list: async () => {
    await delay();
    return { data: MOCK_NOTIFICATIONS } as any;
  },
  markRead: async (id: string) => {
    await delay();
    return { data: { detail: "Notification marked as read." } } as any;
  },
  createAnnouncement: async (message: string) => {
    await delay();
    return { data: { detail: "Announcement sent." } } as any;
  },
};

export const statsService = {
  overview: async () => {
    await delay();
    return { data: MOCK_STATS } as any;
  },
};
