import "server-only";
import type { AccessPermission, Document, DocumentAccess, Member, Prisma, Role } from "@prisma/client";
import { ApiError } from "./http";

type DocWithAccess = Pick<Document, "ownerId" | "visibility"> & { accesses: Pick<DocumentAccess, "memberId" | "permission">[] };

const RANK: Record<Role, number> = { EXTERNAL_GUEST: 0, VIEWER: 1, EDITOR: 2, ADMIN: 3, SUPER_ADMIN: 4 };

export const isAdmin = (m: Pick<Member, "role">) => RANK[m.role] >= RANK.ADMIN;
export const atLeast = (m: Pick<Member, "role">, role: Role) => RANK[m.role] >= RANK[role];

function grant(doc: DocWithAccess, memberId: string): AccessPermission | null {
  return doc.accesses.find((a) => a.memberId === memberId)?.permission ?? null;
}

/**
 * Quy tắc xem:
 * - Admin: mọi tài liệu. Chủ sở hữu và người được cấp quyền: luôn xem được.
 * - Editor/Viewer: tài liệu TEAM và PUBLIC. Khách ngoài: chỉ tài liệu được cấp quyền trực tiếp.
 */
export function canView(m: Member, doc: DocWithAccess): boolean {
  if (isAdmin(m) || doc.ownerId === m.id || grant(doc, m.id)) return true;
  if (m.role === "EXTERNAL_GUEST") return false;
  return doc.visibility !== "PRIVATE";
}

export function canEdit(m: Member, doc: DocWithAccess): boolean {
  if (isAdmin(m) || doc.ownerId === m.id) return true;
  const g = grant(doc, m.id);
  if (g === "EDIT" || g === "OWNER") return true;
  return m.role === "EDITOR" && doc.visibility !== "PRIVATE";
}

export const canDelete = (m: Member, doc: DocWithAccess) => isAdmin(m) || doc.ownerId === m.id;
export const canShare = (m: Member, doc: DocWithAccess) => atLeast(m, "EDITOR") && canEdit(m, doc);
export const canCreate = (m: Member) => atLeast(m, "EDITOR");

export function assert(condition: boolean): asserts condition {
  if (!condition) throw new ApiError("forbidden");
}

/** Điều kiện Prisma tương ứng canView, để lọc ngay trong truy vấn */
export function viewableWhere(m: Member): Prisma.DocumentWhereInput {
  if (isAdmin(m)) return {};
  const direct = [{ ownerId: m.id }, { accesses: { some: { memberId: m.id } } }];
  if (m.role === "EXTERNAL_GUEST") return { OR: direct };
  return { OR: [...direct, { visibility: { in: ["TEAM", "PUBLIC"] } }] };
}
