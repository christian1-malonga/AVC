import { api } from "../client";

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  leadership_code?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: "member" | "president" | "secretary" | "custodian";
  section?: "bass" | "tenor" | "alto" | "soprano" | null;
  date_joined: string;
  approved: boolean;
  is_approved?: boolean;
  avatar?: string | null;
}

export const authService = {
  register: (data: RegisterPayload) => api.post<{ user: AuthUser }>("/auth/register/", data),
  login: (data: LoginPayload) => api.post<{ token: string; user: AuthUser }>("/auth/login/", data),
  me: () => api.get<AuthUser>("/auth/me/"),
  logout: () => api.post("/auth/logout/"),
  setSection: (section: string) => api.post("/auth/section/", { section }),
  updateProfile: (data: { full_name?: string; phone?: string; section?: string }) =>
    api.patch<AuthUser>("/accounts/profile/", data),
};