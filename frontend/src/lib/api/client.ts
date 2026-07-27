function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("avc_token");
  } catch {
    return null;
  }
}

const BASE_URL =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://localhost:4000"
    : "";

export { BASE_URL };

function clearAuth() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("avc_token");
    localStorage.removeItem("avc_user");
  } catch { /* ignore */ }
}

async function request<T>(method: string, url: string, data?: any, config?: any): Promise<{ data: T; status: number }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const isFormData = data instanceof FormData;
  if (isFormData) {
    delete headers["Content-Type"];
  }

  const options: RequestInit = {
    method,
    headers,
    body: data ? (isFormData ? data : JSON.stringify(data)) : undefined,
  };

  const response = await fetch(`${BASE_URL}${url}`, options);

  if (response.status === 401) {
    clearAuth();
  }

  let body: any;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    body = await response.json();
  } else {
    body = await response.text();
  }

  if (!response.ok) {
    const error: any = new Error(body?.detail || body?.message || `Request failed: ${response.status}`);
    error.response = { status: response.status, data: body };
    throw error;
  }

  return { data: body?.data ?? body, status: response.status };
}

export const api = {
  get: <T>(url: string, config?: any) => request<T>("GET", url, undefined, config),
  post: <T>(url: string, data?: any, config?: any) => request<T>("POST", url, data, config),
  patch: <T>(url: string, data?: any) => request<T>("PATCH", url, data),
  delete: (url: string) => request<any>("DELETE", url),
};
