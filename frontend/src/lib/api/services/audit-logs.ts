import { api } from "../client";

export interface AuditLog {
  id: number;
  action: string;
  performed_by: string;
  target_user: string | null;
  details: string;
  created_at: string;
  performed_by_name: string;
  target_user_name: string | null;
}

export const auditLogsService = {
  list: () => api.get<AuditLog[]>("/audit-logs/"),
};
