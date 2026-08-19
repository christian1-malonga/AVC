import { api } from "../client";

export interface AttendanceRecord {
  id: number;
  user_id?: string;
  user_name: string;
  user_email: string;
  date: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  late_fee?: number;
  marked_by?: string;
  created_at: string;
}

export interface AttendanceSummary {
  present_count: number;
  absent_count: number;
  late_count: number;
  total_sessions: number;
  percentage: number;
  history: AttendanceRecord[];
}

interface MarkRecord {
  user_id: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  late_fee?: number;
}

export const attendanceService = {
  my: async () => {
    return await api.get<AttendanceSummary>("/choir/attendance/my/");
  },
  list: async () => {
    return await api.get<AttendanceRecord[]>("/choir/attendance/");
  },
  mark: async (date: string, records: MarkRecord[]) => {
    return await api.post<{ detail: string }>("/choir/attendance/", { date, records });
  },
};
