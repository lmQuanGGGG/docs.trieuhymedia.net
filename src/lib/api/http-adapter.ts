import type { DocumentItem } from "@/types";
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
  uploadDocument: (file, meta, onProgress) =>
    new Promise((resolve, reject) => {
      // XHR thay vì fetch để có sự kiện tiến trình upload
      const xhr = new XMLHttpRequest();
      const query = new URLSearchParams(meta).toString();
      xhr.open("POST", `/api/documents/upload?${query}`);
      xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
      xhr.setRequestHeader("X-File-Name", encodeURIComponent(file.name));
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => {
        let body: { error?: ApiErrorCode } & Record<string, unknown> = {};
        try {
          body = JSON.parse(xhr.responseText) as typeof body;
        } catch {
          // phản hồi không phải JSON (vd. nginx 413)
        }
        if (xhr.status >= 200 && xhr.status < 300) resolve(body as unknown as DocumentItem);
        else {
          if (xhr.status === 401) redirectToLogin();
          reject(new ApiClientError(body.error ?? (xhr.status === 413 ? "bad_request" : "server_error"), xhr.status));
        }
      };
      xhr.onerror = () => reject(new ApiClientError("network", 0));
      xhr.send(file);
    }),
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
  uploadVariant: (documentId, locale, file) => {
    const form = new FormData();
    form.set("file", file);
    form.set("locale", locale);
    return request(`/api/documents/${documentId}/variants`, { method: "POST", body: form });
  },
  deleteVariant: (documentId, locale) =>
    request(`/api/documents/${documentId}/variants/${encodeURIComponent(locale)}`, { method: "DELETE" }),
  getShare: (documentId) => request(`/api/documents/${documentId}/share`),
  updateShare: (documentId, input) => request(`/api/documents/${documentId}/share`, { method: "PUT", json: input }),
  listCollections: () => request("/api/collections"),
  createCollection: (input) => request("/api/collections", { method: "POST", json: input }),
  updateCollection: (id, input) => request(`/api/collections/${id}`, { method: "PATCH", json: input }),
  deleteCollection: async (id) => {
    await request(`/api/collections/${id}`, { method: "DELETE" });
  },
  login: async (email, password) => {
    await request("/api/auth/login", { method: "POST", json: { email, password } });
  },
  logout: async () => {
    await request("/api/auth/logout", { method: "POST" });
  },
};
