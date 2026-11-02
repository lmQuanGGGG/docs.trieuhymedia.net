export const documentTypes = ["pdf", "docx", "pptx", "xlsx", "image", "video", "link"] as const;
export type DocumentType = (typeof documentTypes)[number];

export const categorySlugs = [
  "proposals",
  "company-profiles",
  "quotations",
  "contracts",
  "presentations",
  "portfolios",
  "brand-assets",
] as const;
export type CategorySlug = (typeof categorySlugs)[number];

export const documentStatuses = ["draft", "review", "approved", "archived"] as const;
export type DocumentStatus = (typeof documentStatuses)[number];

export const visibilities = ["private", "team", "public"] as const;
export type Visibility = (typeof visibilities)[number];

export const brands = ["Triệu Hỷ Media", "HỶ GARDEN", "Coco Drama", "TASTING"] as const;
export type Brand = (typeof brands)[number];

export const roles = ["superAdmin", "admin", "editor", "viewer", "guest"] as const;
export type Role = (typeof roles)[number];

export type MemberStatus = "active" | "invited" | "suspended";

export interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: MemberStatus;
  title: string;
  initials: string;
  /** Màu nền avatar, dạng hex */
  color: string;
  lastActiveAt: string;
}

export interface Folder {
  id: string;
  name: string;
  brand: Brand;
  parentId: string | null;
  color: string;
}

export interface DocumentVersion {
  version: number;
  note: string;
  authorId: string;
  createdAt: string;
  sizeBytes: number;
}

export interface DocumentVariantInfo {
  locale: string;
  type: DocumentType;
  sizeBytes: number;
  hasPreview: boolean;
  updatedAt: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  description: string;
  type: DocumentType;
  category: CategorySlug;
  brand: Brand;
  folderId: string | null;
  ownerId: string;
  status: DocumentStatus;
  visibility: Visibility;
  starred: boolean;
  sharedWithMe: boolean;
  createdAt: string;
  updatedAt: string;
  sizeBytes: number;
  pages?: number;
  tags: string[];
  /** Tệp gốc (DOCX, XLSX, ảnh…) để đọc trực tiếp và tải xuống */
  fileUrl?: string;
  /** Bản PDF để xem trực tiếp (PDF gốc, hoặc PDF máy chủ chuyển từ PPTX) */
  previewUrl?: string;
  externalUrl?: string;
  versions: DocumentVersion[];
  shareToken?: string;
  /** Ngôn ngữ của tệp gốc */
  locale: string;
  /** Các bản dịch đã tải lên (ngoài bản gốc) */
  variants: DocumentVariantInfo[];
  /** Quyền của người đang đăng nhập với tài liệu này (server tính) */
  can?: { edit: boolean; delete: boolean; share: boolean };
}

export const activityActions = [
  "created",
  "updated",
  "shared",
  "downloaded",
  "renamed",
  "deleted",
  "commented",
  "invited",
] as const;
export type ActivityAction = (typeof activityActions)[number];

export interface ActivityItem {
  id: string;
  actorId: string;
  action: ActivityAction;
  documentId?: string;
  targetName: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  actorId: string;
  action: ActivityAction;
  targetName: string;
  createdAt: string;
  read: boolean;
}

export interface ShareSettings {
  token: string;
  documentId: string;
  isActive: boolean;
  allowDownload: boolean;
  passwordProtected: boolean;
  expiresAt: string | null;
  views: number;
}
