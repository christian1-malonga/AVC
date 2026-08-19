import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AuthUser } from "@/lib/api/services/auth";

export type Role = "member" | "president" | "secretary" | "custodian" | "provost";
export type Section = "bass" | "tenor" | "alto" | "soprano";

const STORAGE_KEY = "avc_user";

interface AuthContextValue {
  user: AuthUser | null;
  hydrated: boolean;
  login: (user: AuthUser, token?: string) => void;
  logout: () => void;
  updateUser: (patch: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw) as AuthUser);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  const persist = useCallback((u: AuthUser | null) => {
    if (u) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else window.localStorage.removeItem(STORAGE_KEY);
  }, []);

  const login = useCallback(
    (u: AuthUser, token?: string) => {
      if (token) window.localStorage.setItem("avc_token", token);
      setUser(u);
      persist(u);
    },
    [persist],
  );

  const logout = useCallback(() => {
    window.localStorage.removeItem("avc_token");
    setUser(null);
    persist(null);
  }, [persist]);

  const updateUser = useCallback(
    (patch: Partial<AuthUser>) => {
      setUser((prev) => {
        if (!prev) return prev;
        const next = { ...prev, ...patch };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const value = useMemo(() => ({ user, hydrated, login, logout, updateUser }), [user, hydrated, login, logout, updateUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
