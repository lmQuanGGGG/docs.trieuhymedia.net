import "server-only";
import type { Member, Prisma, ShareCollection } from "@prisma/client";
import { jwtVerify, SignJWT } from "jose";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import { db } from "@/server/db";
import { serverEnv } from "@/server/env";
import { ApiError } from "@/server/http";
import { initialsOf, roleToDto } from "@/server/mappers";
import { assert, atLeast, canShare, canView, isAdmin } from "@/server/permissions";
import type { ShareCollectionItem } from "@/types";
import { logActivity } from "./activity";
import { pickFile } from "./documents";
import { documentInclude, toDocumentDto } from "./serialize";
import { newToken } from "./share";

export const collectionCookieName = (token: string) => `thm_col_${token.replace(/[^a-zA-Z0-9_-]/g, "")}`;

export interface CollectionInput {
  title: string;
  description?: string;
  mode: "all" | "selected";
  includePrivate: boolean;
  documentIds: string[];
  allowDownload: boolean;
  isActive: boolean;
  /** undefined: giữ nguyên, "": gỡ mật khẩu */
  password?: string;
  expiresAt: string | null;
  renew?: boolean;
}

/** Điều kiện tài liệu thuộc bộ chia sẻ (chế độ "tất cả" tự cập nhật theo tài liệu mới) */
function docsWhere(c: Pick<ShareCollection, "id" | "mode" | "includePrivate" | "createdById">): Prisma.DocumentWhereInput {
  if (c.mode === "ALL_MINE") {
    return {
      deletedAt: null,
      ownerId: c.createdById,
      ...(c.includePrivate ? {} : { visibility: { not: "PRIVATE" } }),
    };
  }
  return { deletedAt: null, collectionItems: { some: { collectionId: c.id } } };
}

async function loadDocs(c: ShareCollection) {
  const docs = await db.document.findMany({
    where: docsWhere(c),
    include: { ...documentInclude, collectionItems: { where: { collectionId: c.id }, select: { position: true } } },
    orderBy: { updatedAt: "desc" },
  });
  if (c.mode === "SELECTED") docs.sort((a, b) => (a.collectionItems[0]?.position ?? 0) - (b.collectionItems[0]?.position ?? 0));
  return docs;
}

async function toItem(c: ShareCollection & { items: { documentId: string; position: number }[] }): Promise<ShareCollectionItem> {
  const count = await db.document.count({ where: docsWhere(c) });
  return {
    id: c.id,
    token: c.token,
    title: c.title,
    description: c.description ?? "",
    mode: c.mode === "ALL_MINE" ? "all" : "selected",
    includePrivate: c.includePrivate,
    documentIds: [...c.items].sort((a, b) => a.position - b.position).map((i) => i.documentId),
    documentCount: count,
    allowDownload: c.allowDownload,
    passwordProtected: !!c.passwordHash,
    expiresAt: c.expiresAt?.toISOString() ?? null,
    isActive: c.isActive,
    views: c.views,
    createdById: c.createdById,
    updatedAt: c.updatedAt.toISOString(),
  };
}

const withItems = { items: { select: { documentId: true, position: true } } } as const;

export async function listCollections(me: Member) {
  const rows = await db.shareCollection.findMany({
    where: isAdmin(me) ? {} : { createdById: me.id },
    include: withItems,
    orderBy: { updatedAt: "desc" },
  });
  return Promise.all(rows.map(toItem));
}

/** Chỉ cho đưa vào bộ những tài liệu mình được quyền chia sẻ */
async function checkSelectable(me: Member, ids: string[]) {
  const docs = await db.document.findMany({ where: { id: { in: ids }, deletedAt: null }, include: documentInclude });
  for (const d of docs) assert(canView(me, d) && canShare(me, d));
  return docs.map((d) => d.id);
}

async function buildData(me: Member, input: CollectionInput) {
  const passwordHash =
    input.password === undefined ? undefined : input.password === "" ? null : await hashPassword(input.password);
  return {
    title: input.title,
    description: input.description || null,
    mode: input.mode === "all" ? ("ALL_MINE" as const) : ("SELECTED" as const),
    includePrivate: input.includePrivate,
    allowDownload: input.allowDownload,
    isActive: input.isActive,
    expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
    ...(passwordHash !== undefined ? { passwordHash } : {}),
    ids: input.mode === "selected" ? await checkSelectable(me, input.documentIds) : [],
  };
}

export async function createCollection(me: Member, input: CollectionInput) {
  assert(atLeast(me, "EDITOR"));
  const { ids, ...data } = await buildData(me, input);
  const c = await db.shareCollection.create({
    data: {
      ...data,
      token: await newToken(input.title),
      createdById: me.id,
      items: { create: ids.map((documentId, position) => ({ documentId, position })) },
    },
    include: withItems,
  });
  await logActivity({ actorId: me.id, action: "SHARED", targetType: "share_link", targetName: c.title });
  return toItem(c);
}

async function ownCollection(me: Member, id: string) {
  const c = await db.shareCollection.findUnique({ where: { id } });
  if (!c) throw new ApiError("not_found");
  assert(c.createdById === me.id || isAdmin(me));
  return c;
}

export async function updateCollection(me: Member, id: string, input: CollectionInput) {
  const existing = await ownCollection(me, id);
  const { ids, ...data } = await buildData(me, input);
  const c = await db.$transaction(async (tx) => {
    await tx.shareCollectionItem.deleteMany({ where: { collectionId: id } });
    return tx.shareCollection.update({
      where: { id },
      data: {
        ...data,
        ...(input.renew ? { token: await newToken(input.title || existing.title) } : {}),
        items: { create: ids.map((documentId, position) => ({ documentId, position })) },
      },
      include: withItems,
    });
  });
  return toItem(c);
}

export async function deleteCollection(me: Member, id: string) {
  await ownCollection(me, id);
  await db.shareCollection.delete({ where: { id } });
}

// ─── Phía người xem công khai ───────────────────────────────────────────────

async function findLive(token: string) {
  const c = await db.shareCollection.findUnique({ where: { token }, include: { createdBy: true } });
  if (!c || !c.isActive || c.createdBy.status !== "ACTIVE") return null;
  if (c.expiresAt && c.expiresAt < new Date()) return null;
  return c;
}

async function unlocked(token: string, cookie: string | undefined) {
  if (!cookie) return false;
  try {
    const { payload } = await jwtVerify(cookie, serverEnv.authSecret, { algorithms: ["HS256"] });
    return payload.sub === `col:${token}`;
  } catch {
    return false;
  }
}

export async function unlockCollection(token: string, password: string): Promise<string> {
  const c = await findLive(token);
  if (!c?.passwordHash) throw new ApiError("not_found");
  if (!(await verifyPassword(password, c.passwordHash))) throw new ApiError("forbidden", "wrong password");
  return new SignJWT({}).setProtectedHeader({ alg: "HS256" }).setSubject(`col:${token}`).setIssuedAt().setExpirationTime("12h").sign(serverEnv.authSecret);
}

export type PublicCollectionResult =
  | { state: "unavailable" }
  | { state: "locked" }
  | { state: "ok"; data: Awaited<ReturnType<typeof buildPublic>> };

async function buildPublic(c: NonNullable<Awaited<ReturnType<typeof findLive>>>) {
  const docs = await loadDocs(c);
  const base = (docId: string) => `/api/share/c/${encodeURIComponent(c.token)}/file/${docId}`;
  return {
    title: c.title,
    description: c.description ?? "",
    allowDownload: c.allowDownload,
    owner: {
      id: c.createdBy.id,
      name: c.createdBy.name,
      email: c.createdBy.email,
      role: roleToDto[c.createdBy.role],
      status: "active" as const,
      title: c.createdBy.title ?? "",
      initials: initialsOf(c.createdBy.name),
      color: c.createdBy.color ?? "#71717A",
      lastActiveAt: c.createdBy.createdAt.toISOString(),
    },
    documents: docs.map((d) => toDocumentDto(d, "", { file: base(d.id), preview: `${base(d.id)}?variant=preview` })),
  };
}

/** Trang bộ chia sẻ: kiểm hạn, mật khẩu; đếm lượt xem trang tổng */
export async function getPublicCollection(token: string, cookie: string | undefined, countView: boolean): Promise<PublicCollectionResult> {
  const c = await findLive(token);
  if (!c) return { state: "unavailable" };
  if (c.passwordHash && !(await unlocked(token, cookie))) return { state: "locked" };
  if (countView) await db.shareCollection.update({ where: { id: c.id }, data: { views: { increment: 1 } } });
  return { state: "ok", data: await buildPublic(c) };
}

export async function resolveCollectionFile(
  token: string,
  cookie: string | undefined,
  docId: string,
  variant: "original" | "preview",
  download: boolean,
  lang: string | null,
) {
  const c = await findLive(token);
  if (!c || (c.passwordHash && !(await unlocked(token, cookie)))) throw new ApiError("not_found");
  if (download && !c.allowDownload) throw new ApiError("forbidden", "download disabled");
  const doc = await db.document.findFirst({ where: { AND: [{ id: docId }, docsWhere(c)] }, include: { variants: true } });
  if (!doc) throw new ApiError("not_found");
  const picked = pickFile(doc, lang, variant);
  if (!picked.key) throw new ApiError("not_found");
  return { key: picked.key, title: doc.title + picked.suffix, mime: picked.mime };
}
