import { api } from "../client";
import type { AuthUser } from "./auth";

export interface Role {
  id: string;
  name: string;
  description: string;
}

export const membersService = {
  list: (params?: { status?: string; section?: string; q?: string }) =>
    api.get<AuthUser[]>("/auth/users/", { params }),
  pendingApprovals: () => api.get<AuthUser[]>("/auth/approvals/pending/"),
  approve: (id: string) => api.post(`/auth/approvals/${id}/approve/`),
  reject: (id: string) => api.post(`/auth/approvals/${id}/reject/`),
  updateRole: (id: string, roleId: string) =>
    api.post(`/auth/users/${id}/role/`, { role_id: roleId }),
  remove: (id: string) => api.delete(`/auth/users/${id}/`),
  listRoles: () => api.get<Role[]>("/auth/roles/"),
};
