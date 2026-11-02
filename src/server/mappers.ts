import "server-only";
import type {
  ActivityAction as DbAction,
  DocumentCategory,
  DocumentStatus as DbStatus,
  DocumentType as DbType,
  Role as DbRole,
  Visibility as DbVisibility,
} from "@prisma/client";
import type { ActivityAction, CategorySlug, DocumentStatus, DocumentType, Role, Visibility } from "@/types";

function invert<K extends string, V extends string>(map: Record<K, V>): Record<V, K> {
  return Object.fromEntries(Object.entries(map).map(([k, v]) => [v, k])) as Record<V, K>;
}

export const typeToDto: Record<DbType, DocumentType> = { PDF: "pdf", DOCX: "docx", PPTX: "pptx", XLSX: "xlsx", IMAGE: "image", LINK: "link" };
export const typeFromDto = invert(typeToDto);

export const categoryToDto: Record<DocumentCategory, CategorySlug> = {
  PROPOSAL: "proposals",
  COMPANY_PROFILE: "company-profiles",
  QUOTATION: "quotations",
  CONTRACT: "contracts",
  PRESENTATION: "presentations",
  PORTFOLIO: "portfolios",
  BRAND_ASSET: "brand-assets",
};
export const categoryFromDto = invert(categoryToDto);

export const statusToDto: Record<DbStatus, DocumentStatus> = { DRAFT: "draft", IN_REVIEW: "review", APPROVED: "approved", ARCHIVED: "archived" };
export const statusFromDto = invert(statusToDto);

export const visibilityToDto: Record<DbVisibility, Visibility> = { PRIVATE: "private", TEAM: "team", PUBLIC: "public" };
export const visibilityFromDto = invert(visibilityToDto);

export const roleToDto: Record<DbRole, Role> = { SUPER_ADMIN: "superAdmin", ADMIN: "admin", EDITOR: "editor", VIEWER: "viewer", EXTERNAL_GUEST: "guest" };
export const roleFromDto = invert(roleToDto);

/** RESTORED/VIEWED chưa có nhãn riêng ở UI nên hiển thị gần nghĩa nhất */
export const actionToDto: Record<DbAction, ActivityAction> = {
  CREATED: "created",
  UPDATED: "updated",
  SHARED: "shared",
  DOWNLOADED: "downloaded",
  RENAMED: "renamed",
  DELETED: "deleted",
  RESTORED: "updated",
  COMMENTED: "commented",
  INVITED: "invited",
  VIEWED: "downloaded",
};

export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
