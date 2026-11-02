import type {
  ActivityItem,
  CollectionMode,
  ShareCollectionItem,
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

export interface CollectionInput {
  title: string;
  description?: string;
  mode: CollectionMode;
  includePrivate: boolean;
  documentIds: string[];
  allowDownload: boolean;
  isActive: boolean;
  password?: string;
  expiresAt: string | null;
  renew?: boolean;
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
  /** Upload stream (tới 2GB), báo % tiến trình */
  uploadDocument(
    file: File,
    meta: { title: string; category: string; brand: string; visibility: string },
    onProgress?: (percent: number) => void,
  ): Promise<DocumentItem>;
  createFolder(input: { name: string; brand: Brand }): Promise<void>;
  createMember(input: { name: string; email: string; role: Role; title?: string; password: string }): Promise<void>;
  resetPassword(memberId: string, password: string): Promise<void>;
  changePassword(currentPassword: string, newPassword: string): Promise<void>;
  setRole(memberId: string, role: Role): Promise<void>;
  removeMember(memberId: string): Promise<void>;
  markNotificationsRead(): Promise<void>;
  uploadVariant(documentId: string, locale: string, file: File): Promise<DocumentItem>;
  deleteVariant(documentId: string, locale: string): Promise<DocumentItem>;
  getShare(documentId: string): Promise<ShareSettings | null>;
  updateShare(documentId: string, input: ShareInput): Promise<ShareSettings>;
  listCollections(): Promise<ShareCollectionItem[]>;
  createCollection(input: CollectionInput): Promise<ShareCollectionItem>;
  updateCollection(id: string, input: CollectionInput): Promise<ShareCollectionItem>;
  deleteCollection(id: string): Promise<void>;
  login(email: string, password: string): Promise<void>;
  logout(): Promise<void>;
}
