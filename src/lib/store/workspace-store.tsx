"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import { api, type ShareInput, type WorkspaceSnapshot } from "@/lib/api";
import type { Brand, DocumentItem, DocumentStatus, Member, Role, ShareSettings, Visibility } from "@/types";

interface WorkspaceState extends WorkspaceSnapshot {
  status: "loading" | "ready" | "error";
}

type Action =
  | { type: "loaded"; payload: WorkspaceSnapshot }
  | { type: "failed" }
  | { type: "setStar"; ids: string[]; starred: boolean }
  | { type: "markAllRead" };

const initialState: WorkspaceState = {
  status: "loading",
  currentUserId: "",
  documents: [],
  folders: [],
  members: [],
  activities: [],
  notifications: [],
};

function reducer(state: WorkspaceState, action: Action): WorkspaceState {
  switch (action.type) {
    case "loaded":
      return { ...action.payload, status: "ready" };
    case "failed":
      return { ...state, status: state.status === "ready" ? "ready" : "error" };
    case "setStar": {
      const set = new Set(action.ids);
      return { ...state, documents: state.documents.map((d) => (set.has(d.id) ? { ...d, starred: action.starred } : d)) };
    }
    case "markAllRead":
      return { ...state, notifications: state.notifications.map((n) => ({ ...n, read: true })) };
  }
}

interface WorkspaceContextValue extends WorkspaceState {
  currentUser: Member | undefined;
  /** Editor trở lên được tạo tài liệu/thư mục (server vẫn kiểm tra lại) */
  canCreate: boolean;
  refresh: () => Promise<void>;
  getDocument: (id: string) => DocumentItem | undefined;
  getMember: (id: string) => Member | undefined;
  setStar: (ids: string[], starred: boolean) => Promise<void>;
  rename: (id: string, title: string) => Promise<void>;
  remove: (ids: string[]) => Promise<number>;
  createDocument: (form: FormData) => Promise<DocumentItem>;
  uploadDocument: (
    file: File,
    meta: { title: string; category: string; brand: string; visibility: string },
    onProgress?: (percent: number) => void,
  ) => Promise<DocumentItem>;
  createFolder: (input: { name: string; brand: Brand }) => Promise<void>;
  setVisibility: (id: string, visibility: Visibility) => Promise<void>;
  setStatus: (id: string, status: DocumentStatus) => Promise<void>;
  uploadVariant: (id: string, locale: string, file: File) => Promise<void>;
  deleteVariant: (id: string, locale: string) => Promise<void>;
  getShare: (id: string) => Promise<ShareSettings | null>;
  updateShare: (id: string, input: ShareInput) => Promise<ShareSettings>;
  setRole: (memberId: string, role: Role) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  createMember: (input: { name: string; email: string; role: Role; title?: string; password: string }) => Promise<void>;
  resetPassword: (memberId: string, password: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

/**
 * Nguồn dữ liệu của toàn bộ khu vực nội bộ. Mỗi thao tác gọi API rồi tải lại
 * snapshot, để giao diện luôn khớp với DB và quyền do server tính.
 */
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const refresh = useCallback(async () => {
    try {
      dispatch({ type: "loaded", payload: await api.getWorkspace() });
    } catch {
      dispatch({ type: "failed" });
    }
  }, []);

  useEffect(() => {
    // Tải dữ liệu ban đầu từ API
    void refresh();
    // Quay lại tab thì tải lại để không thao tác trên dữ liệu cũ (tài liệu người khác đã xoá/sửa)
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refresh]);

  const getDocument = useCallback((id: string) => state.documents.find((d) => d.id === id), [state.documents]);
  const getMember = useCallback((id: string) => state.members.find((m) => m.id === id), [state.members]);

  const value = useMemo<WorkspaceContextValue>(() => {
    // Gọi API rồi tải lại; lỗi được ném ra để component hiện toast
    const mutate = async <T,>(fn: () => Promise<T>): Promise<T> => {
      const result = await fn();
      await refresh();
      return result;
    };
    const currentUser = state.members.find((m) => m.id === state.currentUserId);
    return {
      ...state,
      currentUser,
      canCreate: !!currentUser && ["superAdmin", "admin", "editor"].includes(currentUser.role),
      refresh,
      getDocument,
      getMember,
      setStar: async (ids, starred) => {
        dispatch({ type: "setStar", ids, starred });
        try {
          await api.setStar(ids, starred);
        } catch (error) {
          await refresh();
          throw error;
        }
      },
      rename: (id, title) => mutate(async () => void (await api.rename(id, title))),
      remove: (ids) => mutate(() => api.remove(ids)),
      createDocument: (form) => mutate(() => api.createDocument(form)),
      uploadDocument: (file, meta, onProgress) => mutate(() => api.uploadDocument(file, meta, onProgress)),
      createFolder: (input) => mutate(() => api.createFolder(input)),
      setVisibility: (id, visibility) => mutate(async () => void (await api.setVisibility(id, visibility))),
      setStatus: (id, status) => mutate(async () => void (await api.setStatus(id, status))),
      uploadVariant: (id, locale, file) => mutate(async () => void (await api.uploadVariant(id, locale, file))),
      deleteVariant: (id, locale) => mutate(async () => void (await api.deleteVariant(id, locale))),
      getShare: (id) => api.getShare(id),
      updateShare: (id, input) => mutate(() => api.updateShare(id, input)),
      setRole: (memberId, role) => mutate(() => api.setRole(memberId, role)),
      removeMember: (memberId) => mutate(() => api.removeMember(memberId)),
      createMember: (input) => mutate(() => api.createMember(input)),
      resetPassword: (memberId, password) => api.resetPassword(memberId, password),
      markAllRead: async () => {
        dispatch({ type: "markAllRead" });
        await api.markNotificationsRead().catch(() => undefined);
      },
    };
  }, [state, refresh, getDocument, getMember]);

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace phải nằm trong WorkspaceProvider");
  return ctx;
}
