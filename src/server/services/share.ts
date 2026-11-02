import "server-only";
import { randomBytes } from "node:crypto";
import type { Member } from "@prisma/client";
import { jwtVerify, SignJWT } from "jose";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import { db } from "@/server/db";
import { serverEnv } from "@/server/env";
import { ApiError } from "@/server/http";
import { initialsOf, roleToDto } from "@/server/mappers";
import { assert, canShare } from "@/server/permissions";
import type { ShareSettings } from "@/types";
import { logActivity } from "./activity";
import { loadDocument, pickFile } from "./documents";
import { documentInclude, toDocumentDto } from "./serialize";

export const shareCookieName = (token: string) => `thm_share_${token.replace(/[^a-zA-Z0-9_-]/g, "")}`;
const UNLOCK_TTL = "12h";

const ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789";

/** Phần đọc được của link: tên tài liệu không dấu, viết thường */
function slugify(title: string): string {
  return title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
}

/** Link dạng ten-tai-lieu-k7m2qx: dễ đọc nhưng không đoán được nhờ 6 ký tự ngẫu nhiên */
export async function newToken(title: string): Promise<string> {
  for (;;) {
    const suffix = Array.from(randomBytes(6), (b) => ALPHABET[b % ALPHABET.length]).join("");
    const slug = slugify(title);
    const token = slug ? `${slug}-${suffix}` : suffix;
    if (!(await db.shareLink.findUnique({ where: { token } }))) return token;
  }
}

async function toSettings(documentId: string): Promise<ShareSettings | null> {
  const link = await db.shareLink.findFirst({
    where: { documentId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { views: true } } },
  });
  if (!link) return null;
  return {
    token: link.token,
    documentId,
    isActive: link.isActive,
    allowDownload: link.allowDownload,
    passwordProtected: !!link.passwordHash,
    expiresAt: link.expiresAt?.toISOString() ?? null,
    views: link._count.views,
  };
}

export async function getShareSettings(me: Member, documentId: string) {
  await loadDocument(me, documentId);
  return toSettings(documentId);
}

/**
 * Bật/cập nhật liên kết công khai. Bật chia sẻ sẽ chuyển tài liệu sang PUBLIC.
 * password: chuỗi rỗng = gỡ mật khẩu, undefined = giữ nguyên.
 */
export async function upsertShareSettings(
  me: Member,
  documentId: string,
  input: { isActive: boolean; allowDownload: boolean; password?: string; expiresAt: string | null; renew?: boolean },
) {
  const doc = await loadDocument(me, documentId);
  assert(canShare(me, doc));
  const existing = await db.shareLink.findFirst({ where: { documentId }, orderBy: { createdAt: "desc" } });
  const passwordHash =
    input.password === undefined ? undefined : input.password === "" ? null : await hashPassword(input.password);
  const data = {
    isActive: input.isActive,
    allowDownload: input.allowDownload,
    expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
    ...(passwordHash !== undefined ? { passwordHash } : {}),
  };

  if (existing) {
    // renew: cấp link mới, link cũ hết hiệu lực ngay (lượt xem cũ vẫn giữ)
    await db.shareLink.update({
      where: { id: existing.id },
      data: input.renew ? { ...data, token: await newToken(doc.title) } : data,
    });
  } else {
    await db.shareLink.create({ data: { ...data, documentId, token: await newToken(doc.title), createdById: me.id } });
  }

  if (input.isActive && doc.visibility !== "PUBLIC") {
    await db.document.update({ where: { id: documentId }, data: { visibility: "PUBLIC" } });
  }
  await logActivity({ actorId: me.id, action: "SHARED", targetType: "share_link", targetName: doc.title, documentId });
  return toSettings(documentId);
}

export type PublicShareResult =
  | { state: "ok"; data: Awaited<ReturnType<typeof buildPublic>> }
  | { state: "locked" }
  | { state: "unavailable" };

async function findLiveLink(token: string) {
  const link = await db.shareLink.findUnique({
    where: { token },
    include: { document: { include: { ...documentInclude, owner: true } } },
  });
  if (!link || !link.isActive) return null;
  if (link.expiresAt && link.expiresAt < new Date()) return null;
  const doc = link.document;
  if (doc.deletedAt || doc.visibility !== "PUBLIC") return null;
  return link;
}

async function buildPublic(link: NonNullable<Awaited<ReturnType<typeof findLiveLink>>>) {
  const base = `/api/share/${encodeURIComponent(link.token)}/file`;
  const doc = link.document;
  return {
    document: toDocumentDto(doc, "", { file: base, preview: `${base}?variant=preview` }),
    owner: {
      id: doc.owner.id,
      name: doc.owner.name,
      email: doc.owner.email,
      role: roleToDto[doc.owner.role],
      status: "active" as const,
      title: doc.owner.title ?? "",
      initials: initialsOf(doc.owner.name),
      color: doc.owner.color ?? "#71717A",
      lastActiveAt: doc.owner.createdAt.toISOString(),
    },
    allowDownload: link.allowDownload,
  };
}

async function isUnlocked(token: string, cookieValue: string | undefined): Promise<boolean> {
  if (!cookieValue) return false;
  try {
    const { payload } = await jwtVerify(cookieValue, serverEnv.authSecret, { algorithms: ["HS256"] });
    return payload.sub === `share:${token}`;
  } catch {
    return false;
  }
}

/** Trang chia sẻ công khai: kiểm hạn, mật khẩu; ghi lượt xem khi mở thành công */
export async function getPublicShare(token: string, unlockCookie: string | undefined, meta: { userAgent?: string; country?: string }, countView = true): Promise<PublicShareResult> {
  const link = await findLiveLink(token);
  if (!link) return { state: "unavailable" };
  if (link.passwordHash && !(await isUnlocked(token, unlockCookie))) return { state: "locked" };
  if (countView) {
    await db.shareView.create({ data: { shareLinkId: link.id, userAgent: meta.userAgent?.slice(0, 300), country: meta.country } });
  }
  return { state: "ok", data: await buildPublic(link) };
}

/** Kiểm mật khẩu, trả JWT ngắn hạn để đặt vào cookie */
export async function unlockShare(token: string, password: string): Promise<string> {
  const link = await findLiveLink(token);
  if (!link?.passwordHash) throw new ApiError("not_found");
  if (!(await verifyPassword(password, link.passwordHash))) throw new ApiError("forbidden", "wrong password");
  return new SignJWT({}).setProtectedHeader({ alg: "HS256" }).setSubject(`share:${token}`).setIssuedAt().setExpirationTime(UNLOCK_TTL).sign(serverEnv.authSecret);
}

/** Lấy khoá tệp cho người xem công khai (không ghi lượt xem) */
export async function resolvePublicFile(token: string, unlockCookie: string | undefined, variant: "original" | "preview", download: boolean, lang: string | null = null) {
  const result = await getPublicShare(token, unlockCookie, {}, false);
  if (result.state !== "ok") throw new ApiError("not_found");
  const link = await findLiveLink(token);
  if (!link) throw new ApiError("not_found");
  if (download && !link.allowDownload) throw new ApiError("forbidden", "download disabled");
  const picked = pickFile(link.document, lang, variant);
  if (!picked.key) throw new ApiError("not_found");
  return { key: picked.key, title: link.document.title + picked.suffix, mime: picked.mime };
}
