import axios, { type AxiosInstance } from "axios";

/**
 * Axios client for the AVC Django REST API.
 * Always uses /api relative path — Vite dev server proxies to Django.
 */
export const api: AxiosInstance = axios.create({
  baseURL: "/api",
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("avc_token");
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    // Central error hook - components/services handle their own toasts.
    if (error?.response?.status === 401) {
      const isLoginRequest = error.config?.url?.includes("/auth/login/");
      if (!isLoginRequest && typeof window !== "undefined") {
        window.localStorage.removeItem("avc_token");
        window.localStorage.removeItem("avc_user");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  },
);
