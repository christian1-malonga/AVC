function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("avc_token");
  } catch {
    return null;
  }
}

async function request<T>(method: string, url: string, data?: any, config?: any): Promise<{ data: T; status: number }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // If data is FormData, let the browser set Content-Type (with boundary)
  const isFormData = data instanceof FormData;
  if (isFormData) {
    delete headers["Content-Type"];
  }

  const options: RequestInit = {
    method,
    headers,
    body: data ? (isFormData ? data : JSON.stringify(data)) : undefined,
  };

  const response = await fetch(url, options);

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
