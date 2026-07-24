import { api } from "../client";

export interface AttendanceRecord {
  id: number;
  user: number;
  user_name: string;
  user_email: string;
  date: string;
  status: "PRESENT" | "ABSENT";
  marked_by?: number;
  created_at: string;
}

export interface AttendanceSummary {
  present_count: number;
  absent_count: number;
  total_sessions: number;
  percentage: number;
  history: AttendanceRecord[];
}

export const attendanceService = {
  my: async () => {
    return await api.get<AttendanceSummary>("/choir/attendance/my/");
  },
  list: async () => {
    return await api.get<AttendanceRecord[]>("/choir/attendance/");
  },
  mark: async (data: { date?: string; user_id?: number; status?: "PRESENT" | "ABSENT"; records?: { user_id: number; status: "PRESENT" | "ABSENT" }[] }) => {
    return await api.post<{ detail: string }>("/choir/attendance/", data);
  },
};
