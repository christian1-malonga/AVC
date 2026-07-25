import type { AuthUser } from "@/lib/api/services/auth";
import type { Role } from "@/lib/api/services/members";
import type { Debt, DebtDetail } from "@/lib/api/services/debts";
import type { AttendanceRecord, AttendanceSummary } from "@/lib/api/services/attendance";
import type { DocItem } from "@/lib/api/services/documents";
import type { Song } from "@/lib/api/services/music";
import type { NotificationItem } from "@/lib/api/services/notifications";

export const MOCK_USERS: Record<string, AuthUser> = {
  president: {
    id: "1",
    full_name: "John President",
    email: "president@avc.com",
    phone: "08012345678",
    role: "president",
    section: "tenor",
    date_joined: "2024-01-15T10:00:00Z",
    approved: true,
    is_approved: true,
  },
  secretary: {
    id: "2",
    full_name: "Jane Secretary",
    email: "secretary@avc.com",
    phone: "08023456789",
    role: "secretary",
    section: "soprano",
    date_joined: "2024-01-20T10:00:00Z",
    approved: true,
    is_approved: true,
  },
  custodian: {
    id: "3",
    full_name: "Mark Custodian",
    email: "custodian@avc.com",
    phone: "08034567890",
    role: "custodian",
    section: "bass",
    date_joined: "2024-02-01T10:00:00Z",
    approved: true,
    is_approved: true,
  },
  member: {
    id: "4",
    full_name: "Sarah Member",
    email: "member@avc.com",
    phone: "08045678901",
    role: "member",
    section: "alto",
    date_joined: "2024-03-10T10:00:00Z",
    approved: true,
    is_approved: true,
  },
};

export function findMockUser(email: string): AuthUser | undefined {
  return Object.values(MOCK_USERS).find((u) => u.email === email);
}

export function createMockUser(email: string): AuthUser {
  const name = email.split("@")[0].replace(/[._-]/g, " ");
  const capitalized = name.replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    id: String(Date.now()),
    full_name: capitalized,
    email,
    phone: "08000000000",
    role: "member",
    date_joined: new Date().toISOString(),
    approved: false,
    is_approved: false,
  };
}

export const MOCK_MEMBERS: AuthUser[] = [
  MOCK_USERS.president,
  MOCK_USERS.secretary,
  MOCK_USERS.custodian,
  MOCK_USERS.member,
  { id: "5", full_name: "David Bass", email: "david@avc.com", phone: "08056789012", role: "member", section: "bass", date_joined: "2024-04-01", approved: true, is_approved: true },
  { id: "6", full_name: "Emily Tenor", email: "emily@avc.com", phone: "08067890123", role: "member", section: "tenor", date_joined: "2024-04-15", approved: true, is_approved: true },
  { id: "7", full_name: "Michael Alto", email: "michael@avc.com", phone: "08078901234", role: "member", section: "alto", date_joined: "2024-05-01", approved: true, is_approved: true },
  { id: "8", full_name: "Lisa Soprano", email: "lisa@avc.com", phone: "08089012345", role: "member", section: "soprano", date_joined: "2024-05-10", approved: true, is_approved: true },
  { id: "9", full_name: "James Pending", email: "james@avc.com", phone: "08090123456", role: "member", date_joined: "2024-06-01", approved: false, is_approved: false },
  { id: "10", full_name: "Anna New", email: "anna@avc.com", phone: "08101234567", role: "member", date_joined: "2024-06-15", approved: false, is_approved: false },
];

export const MOCK_ROLES: Role[] = [
  { id: "1", name: "MEMBER", description: "Regular choir member" },
  { id: "2", name: "PRESIDENT", description: "Choir president" },
  { id: "3", name: "SECRETARY", description: "Choir secretary" },
  { id: "4", name: "CUSTODIAN", description: "Choir custodian" },
];

export const MOCK_DEBTS: Debt[] = [
  {
    id: "1",
    user_name: "Sarah Member",
    total_absence_debt: 5000,
    total_late_debt: 2000,
    total_paid: 3000,
    total_debt: 4000,
    updated_at: "2024-06-20",
    details: [
      { id: "d1", amount: 2000, reason: "Absent 10/05/2024", date: "2024-05-10", created_at: "2024-05-10" },
      { id: "d2", amount: 3000, reason: "Absent 17/05/2024", date: "2024-05-17", created_at: "2024-05-17" },
      { id: "d3", amount: 2000, reason: "Late 24/05/2024", date: "2024-05-24", created_at: "2024-05-24" },
    ],
  },
  {
    id: "2",
    user_name: "David Bass",
    total_absence_debt: 3000,
    total_late_debt: 1000,
    total_paid: 2000,
    total_debt: 2000,
    updated_at: "2024-06-20",
    details: [
      { id: "d4", amount: 3000, reason: "Absent 03/06/2024", date: "2024-06-03", created_at: "2024-06-03" },
      { id: "d5", amount: 1000, reason: "Late 10/06/2024", date: "2024-06-10", created_at: "2024-06-10" },
    ],
  },
  {
    id: "3",
    user_name: "Emily Tenor",
    total_absence_debt: 0,
    total_late_debt: 3000,
    total_paid: 1500,
    total_debt: 1500,
    updated_at: "2024-06-20",
    details: [
      { id: "d6", amount: 1500, reason: "Late 01/06/2024", date: "2024-06-01", created_at: "2024-06-01" },
      { id: "d7", amount: 1500, reason: "Late 15/06/2024", date: "2024-06-15", created_at: "2024-06-15" },
    ],
  },
];

export const MOCK_ATTENDANCE: AttendanceRecord[] = [
  { id: 1, user: 4, user_name: "Sarah Member", user_email: "member@avc.com", date: "2024-06-03", status: "PRESENT", created_at: "2024-06-03" },
  { id: 2, user: 4, user_name: "Sarah Member", user_email: "member@avc.com", date: "2024-06-10", status: "ABSENT", created_at: "2024-06-10" },
  { id: 3, user: 4, user_name: "Sarah Member", user_email: "member@avc.com", date: "2024-06-17", status: "PRESENT", created_at: "2024-06-17" },
  { id: 4, user: 5, user_name: "David Bass", user_email: "david@avc.com", date: "2024-06-03", status: "PRESENT", created_at: "2024-06-03" },
  { id: 5, user: 5, user_name: "David Bass", user_email: "david@avc.com", date: "2024-06-10", status: "PRESENT", created_at: "2024-06-10" },
  { id: 6, user: 6, user_name: "Emily Tenor", user_email: "emily@avc.com", date: "2024-06-03", status: "ABSENT", created_at: "2024-06-03" },
  { id: 7, user: 6, user_name: "Emily Tenor", user_email: "emily@avc.com", date: "2024-06-10", status: "PRESENT", created_at: "2024-06-10" },
];

export const MOCK_DOCUMENTS: DocItem[] = [
  { id: "doc1", title: "Meeting Minutes - June 2024", category: "minutes", file: "/docs/june-minutes.pdf", uploaded_by_name: "Jane Secretary", uploaded_at: "2024-06-15", size: 245000 },
  { id: "doc2", title: "Choir Budget 2024", category: "general", file: "/docs/budget-2024.pdf", uploaded_by_name: "Mark Custodian", uploaded_at: "2024-06-10", size: 180000 },
  { id: "doc3", title: "Rehearsal Schedule", category: "announcement", file: "/docs/schedule.pdf", uploaded_by_name: "John President", uploaded_at: "2024-06-05", size: 120000 },
  { id: "doc4", title: "Debt Policy Update", category: "debt", file: "/docs/debt-policy.pdf", uploaded_by_name: "John President", uploaded_at: "2024-06-01", size: 95000 },
  { id: "doc5", title: "Meeting Minutes - May 2024", category: "minutes", file: "/docs/may-minutes.pdf", uploaded_by_name: "Jane Secretary", uploaded_at: "2024-05-20", size: 210000 },
];

export const MOCK_SONGS: Song[] = [
  { id: "song1", title: "Amazing Grace", composer: "John Newton", category: "hymn", upload_date: "2024-01-15" },
  { id: "song2", title: "How Great Thou Art", composer: "Carl Boberg", category: "hymn", upload_date: "2024-02-01" },
  { id: "song3", title: "Total Praise", composer: "Richard Smallwood", category: "gospel", upload_date: "2024-02-15" },
  { id: "song4", title: "Great Is Thy Faithfulness", composer: "Thomas Chisholm", category: "hymn", upload_date: "2024-03-01" },
  { id: "song5", title: "Every Praise", composer: "Hezekiah Walker", category: "gospel", upload_date: "2024-03-15" },
  { id: "song6", title: "Hallelujah Chorus", composer: "G.F. Handel", category: "classical", upload_date: "2024-04-01" },
];

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  { id: "n1", type: "announcement", message: "Rehearsal this Saturday at 10 AM", is_read: false, created_at: "2024-06-22T08:00:00Z" },
  { id: "n2", type: "reminder", message: "Debt payment deadline approaching", is_read: false, created_at: "2024-06-21T14:00:00Z" },
  { id: "n3", type: "announcement", message: "New sheet music available for download", is_read: true, created_at: "2024-06-20T10:00:00Z" },
  { id: "n4", type: "reminder", message: "Please confirm attendance for Sunday service", is_read: true, created_at: "2024-06-19T09:00:00Z" },
];

export function getMyAttendance(email: string): AttendanceSummary {
  const records = MOCK_ATTENDANCE.filter((r) => r.user_email === email);
  const present = records.filter((r) => r.status === "PRESENT").length;
  const absent = records.filter((r) => r.status === "ABSENT").length;
  const total = records.length;
  return {
    present_count: present,
    absent_count: absent,
    total_sessions: total,
    percentage: total > 0 ? Math.round((present / total) * 100) : 0,
    history: records,
  };
}

export function getMyDebts(email: string): Debt | null {
  const user = Object.values(MOCK_USERS).find((u) => u.email === email);
  if (!user) return null;
  const debt = MOCK_DEBTS.find((d) => d.user_name === user.full_name);
  return debt || {
    id: "0",
    user_name: user.full_name,
    total_absence_debt: 0,
    total_late_debt: 0,
    total_paid: 0,
    total_debt: 0,
    updated_at: new Date().toISOString().split("T")[0],
    details: [],
  };
}

export const MOCK_STATS = {
  total_members: 8,
  active_members: 6,
  pending_approvals: 2,
  total_debt: 7500,
  total_collected: 6500,
  attendance_rate: 72,
  recent_attendance: [
    { date: "2024-06-03", present: 5, absent: 1 },
    { date: "2024-06-10", present: 3, absent: 3 },
    { date: "2024-06-17", present: 4, absent: 2 },
  ],
};
