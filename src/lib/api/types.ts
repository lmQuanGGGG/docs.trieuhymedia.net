import type {
  ActivityItem,
  Brand,
  DocumentItem,
  Folder,
  Member,
  NotificationItem,
  Role,
  ShareSettings,
  Visibility,
} from "@/types";

export interface WorkspaceSnapshot {
  currentUserId: string;
  documents: DocumentItem[];
  folders: Folder[];
  members: Member[];
  activities: ActivityItem[];
  notifications: NotificationItem[];
}

export interface ShareInput {
  isActive: boolean;
  allowDownload: boolean;
  /** undefined: giữ nguyên, "": gỡ mật khẩu */
  password?: string;
  expiresAt: string | null;
  /** true: cấp link mới, link cũ hết hiệu lực */
  renew?: boolean;
}

/** Hợp đồng giữa UI và backend (Route Handlers trong src/app/api) */
export interface DocsApi {
  getWorkspace(): Promise<WorkspaceSnapshot>;
  setStar(ids: string[], starred: boolean): Promise<void>;
  rename(id: string, title: string): Promise<DocumentItem>;
  setVisibility(id: string, visibility: Visibility): Promise<DocumentItem>;
  remove(ids: string[]): Promise<number>;
  createDocument(form: FormData): Promise<DocumentItem>;
  createFolder(input: { name: string; brand: Brand }): Promise<void>;
  createMember(input: { name: string; email: string; role: Role; title?: string; password: string }): Promise<void>;
  resetPassword(memberId: string, password: string): Promise<void>;
  changePassword(currentPassword: string, newPassword: string): Promise<void>;
  setRole(memberId: string, role: Role): Promise<void>;
  removeMember(memberId: string): Promise<void>;
  markNotificationsRead(): Promise<void>;
  getShare(documentId: string): Promise<ShareSettings | null>;
  updateShare(documentId: string, input: ShareInput): Promise<ShareSettings>;
  login(email: string, password: string): Promise<void>;
  logout(): Promise<void>;
}
