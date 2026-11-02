import type { DocsApi } from "./types";

export type ApiErrorCode = "unauthorized" | "forbidden" | "not_found" | "bad_request" | "conflict" | "server_error" | "network";

export class ApiClientError extends Error {
  constructor(
    readonly code: ApiErrorCode,
    readonly status: number,
  ) {
    super(code);
  }
}

/** Hết phiên giữa chừng: đưa về trang đăng nhập của đúng ngôn ngữ */
function redirectToLogin() {
  const locale = window.location.pathname.split("/")[1] || "vi";
  const next = window.location.pathname.replace(/^\/[^/]+/, "") || "/";
  // Tải lại toàn trang: dữ liệu cũ trong bộ nhớ không còn hợp lệ
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.href = `/${locale}/login?next=${encodeURIComponent(next)}`;
}

async function request<T>(url: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const { json, ...rest } = init ?? {};
  let res: Response;
  try {
    res = await fetch(url, {
      ...rest,
      credentials: "same-origin",
      headers: json !== undefined ? { "Content-Type": "application/json", ...rest.headers } : rest.headers,
      body: json !== undefined ? JSON.stringify(json) : rest.body,
    });
  } catch {
    throw new ApiClientError("network", 0);
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: ApiErrorCode };
    if (res.status === 401 && !url.startsWith("/api/auth/")) redirectToLogin();
    throw new ApiClientError(body.error ?? "server_error", res.status);
  }
  return (await res.json()) as T;
}

export const httpApi: DocsApi = {
  getWorkspace: () => request("/api/workspace"),
  setStar: async (ids, starred) => {
    await request("/api/documents/star", { method: "POST", json: { ids, starred } });
  },
  rename: (id, title) => request(`/api/documents/${id}`, { method: "PATCH", json: { title } }),
  setVisibility: (id, visibility) => request(`/api/documents/${id}`, { method: "PATCH", json: { visibility } }),
  remove: async (ids) => (await request<{ deleted: number }>("/api/documents/delete", { method: "POST", json: { ids } })).deleted,
  createDocument: (form) => request("/api/documents", { method: "POST", body: form }),
  createFolder: async (input) => {
    await request("/api/folders", { method: "POST", json: input });
  },
  createMember: async (input) => {
    await request("/api/members", { method: "POST", json: input });
  },
  resetPassword: async (memberId, password) => {
    await request(`/api/members/${memberId}/password`, { method: "POST", json: { password } });
  },
  changePassword: async (currentPassword, newPassword) => {
    await request("/api/auth/password", { method: "POST", json: { currentPassword, newPassword } });
  },
  setRole: async (memberId, role) => {
    await request(`/api/members/${memberId}`, { method: "PATCH", json: { role } });
  },
  removeMember: async (memberId) => {
    await request(`/api/members/${memberId}`, { method: "DELETE" });
  },
  markNotificationsRead: async () => {
    await request("/api/notifications/read", { method: "POST" });
  },
  getShare: (documentId) => request(`/api/documents/${documentId}/share`),
  updateShare: (documentId, input) => request(`/api/documents/${documentId}/share`, { method: "PUT", json: input }),
  login: async (email, password) => {
    await request("/api/auth/login", { method: "POST", json: { email, password } });
  },
  logout: async () => {
    await request("/api/auth/logout", { method: "POST" });
  },
};
