import "server-only";
import type { Member } from "@prisma/client";
import { db } from "@/server/db";
import { ApiError } from "@/server/http";
import { categoryFromDto, typeFromDto, visibilityFromDto } from "@/server/mappers";
import { assert, canCreate, canDelete, canEdit, canShare, canView } from "@/server/permissions";
import { removePrefix, safeFileName, saveFile } from "@/server/storage";
import type { Brand, CategorySlug, DocumentType, Visibility } from "@/types";
import { logActivity } from "./activity";
import { documentInclude, toDocumentDto } from "./serialize";

export const MAX_UPLOAD_BYTES = 200 * 1024 * 1024;

const MIME_BY_TYPE: Record<DocumentType, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  image: "",
  link: "text/uri-list",
};

export function inferType(name: string, mime: string): DocumentType {
  const n = name.toLowerCase();
  if (n.endsWith(".pdf")) return "pdf";
  if (n.endsWith(".doc") || n.endsWith(".docx")) return "docx";
  if (n.endsWith(".ppt") || n.endsWith(".pptx")) return "pptx";
  if (n.endsWith(".xls") || n.endsWith(".xlsx") || n.endsWith(".csv")) return "xlsx";
  if (mime.startsWith("image/")) return "image";
  throw new ApiError("bad_request", "unsupported file type");
}

/** Lấy tài liệu kèm quan hệ và kiểm quyền xem; tài liệu đã xoá coi như không tồn tại */
export async function loadDocument(me: Member, id: string) {
  const doc = await db.document.findFirst({ where: { id, deletedAt: null }, include: documentInclude });
  if (!doc || !canView(me, doc)) throw new ApiError("not_found");
  return doc;
}

export function dto(me: Member, doc: Awaited<ReturnType<typeof loadDocument>>) {
  return toDocumentDto(doc, me.id, {}, { edit: canEdit(me, doc), delete: canDelete(me, doc), share: canShare(me, doc) });
}

export async function createDocument(
  me: Member,
  input: {
    title: string;
    category: CategorySlug;
    brand: Brand;
    visibility: Visibility;
    folderId?: string | null;
    type?: DocumentType;
    externalUrl?: string;
    file?: File;
  },
) {
  assert(canCreate(me));
  if (input.file && input.file.size > MAX_UPLOAD_BYTES) throw new ApiError("bad_request", "file too large");
  const type = input.file ? inferType(input.file.name, input.file.type) : (input.type ?? "docx");
  // Trình duyệt đôi khi gửi loại chung chung: suy ra từ đuôi tệp để trình đọc nhận đúng định dạng
  const sent = input.file?.type ?? "";
  const mime = sent && sent !== "application/octet-stream" ? sent : MIME_BY_TYPE[type];

  const doc = await db.document.create({
    data: {
      title: input.title,
      type: typeFromDto[type],
      category: categoryFromDto[input.category],
      brand: input.brand,
      visibility: visibilityFromDto[input.visibility],
      status: "DRAFT",
      folderId: input.folderId ?? null,
      ownerId: me.id,
      externalUrl: type === "link" ? input.externalUrl : null,
      mimeType: input.file ? mime : null,
      sizeBytes: input.file ? BigInt(input.file.size) : null,
    },
  });

  if (input.file) {
    const key = `documents/${doc.id}/v1-${safeFileName(input.file.name)}`;
    await saveFile(key, new Uint8Array(await input.file.arrayBuffer()));
    await db.document.update({
      where: { id: doc.id },
      data: {
        fileUrl: key,
        // PDF đọc trực tiếp; PPTX cần dịch vụ chuyển đổi (chưa có) nên chưa có bản xem
        previewUrl: type === "pdf" ? key : null,
        versions: { create: { version: 1, fileUrl: key, sizeBytes: BigInt(input.file.size), note: input.file.name, createdById: me.id } },
      },
    });
  }

  await logActivity({ actorId: me.id, action: "CREATED", targetType: "document", targetName: doc.title, documentId: doc.id });
  return dto(me, await loadDocument(me, doc.id));
}

export async function updateDocument(
  me: Member,
  id: string,
  patch: { title?: string; visibility?: Visibility },
) {
  const doc = await loadDocument(me, id);
  assert(canEdit(me, doc));
  if (patch.visibility === "public") assert(canShare(me, doc));

  await db.document.update({
    where: { id },
    data: {
      title: patch.title,
      visibility: patch.visibility ? visibilityFromDto[patch.visibility] : undefined,
    },
  });
  if (patch.title && patch.title !== doc.title) {
    await logActivity({ actorId: me.id, action: "RENAMED", targetType: "document", targetName: patch.title, documentId: id, metadata: { from: doc.title } });
  } else {
    await logActivity({ actorId: me.id, action: "UPDATED", targetType: "document", targetName: doc.title, documentId: id });
  }
  return dto(me, await loadDocument(me, id));
}

/** Xoá mềm (deletedAt); tệp giữ nguyên để có thể khôi phục */
export async function deleteDocuments(me: Member, ids: string[]): Promise<number> {
  const docs = await db.document.findMany({ where: { id: { in: ids }, deletedAt: null }, include: documentInclude });
  for (const doc of docs) assert(canView(me, doc) && canDelete(me, doc));
  await db.document.updateMany({ where: { id: { in: docs.map((d) => d.id) } }, data: { deletedAt: new Date() } });
  await Promise.all(
    docs.map((d) => logActivity({ actorId: me.id, action: "DELETED", targetType: "document", targetName: d.title, documentId: d.id, metadata: { soft: true } })),
  );
  return docs.length;
}

export async function setStars(me: Member, ids: string[], starred: boolean): Promise<void> {
  const docs = await db.document.findMany({ where: { id: { in: ids }, deletedAt: null }, include: documentInclude });
  const allowed = docs.filter((d) => canView(me, d)).map((d) => d.id);
  if (starred) {
    await db.documentStar.createMany({ data: allowed.map((documentId) => ({ memberId: me.id, documentId })), skipDuplicates: true });
  } else {
    await db.documentStar.deleteMany({ where: { memberId: me.id, documentId: { in: allowed } } });
  }
}

/** Dùng khi cần dọn tệp của tài liệu bị xoá vĩnh viễn (chưa có UI) */
export const purgeFiles = (id: string) => removePrefix(`documents/${id}`);

export const SUPPORTED_LOCALES = ["vi", "en", "zh-CN"] as const;

/** Tải lên/thay bản dịch của tài liệu cho một ngôn ngữ */
export async function upsertVariant(me: Member, id: string, locale: string, file: File) {
  const doc = await loadDocument(me, id);
  assert(canEdit(me, doc));
  if (!SUPPORTED_LOCALES.includes(locale as (typeof SUPPORTED_LOCALES)[number])) throw new ApiError("bad_request", "locale");
  if (locale === doc.locale) throw new ApiError("bad_request", "same as original");
  if (file.size > MAX_UPLOAD_BYTES) throw new ApiError("bad_request", "file too large");
  const type = inferType(file.name, file.type);
  const key = `documents/${id}/${locale}-${Date.now().toString(36)}-${safeFileName(file.name)}`;
  await saveFile(key, new Uint8Array(await file.arrayBuffer()));
  const sent = file.type && file.type !== "application/octet-stream" ? file.type : MIME_BY_TYPE[type];
  const data = {
    fileUrl: key,
    previewUrl: type === "pdf" ? key : null,
    sizeBytes: BigInt(file.size),
    mimeType: sent || null,
    createdById: me.id,
  };
  await db.documentVariant.upsert({
    where: { documentId_locale: { documentId: id, locale } },
    update: data,
    create: { ...data, documentId: id, locale },
  });
  await logActivity({ actorId: me.id, action: "UPDATED", targetType: "document", targetName: doc.title, documentId: id, metadata: { variant: locale } });
  return dto(me, await loadDocument(me, id));
}

export async function deleteVariant(me: Member, id: string, locale: string) {
  const doc = await loadDocument(me, id);
  assert(canEdit(me, doc));
  await db.documentVariant.deleteMany({ where: { documentId: id, locale } });
  return dto(me, await loadDocument(me, id));
}

/** Chọn khoá tệp theo ngôn ngữ: có bản dịch thì dùng, không thì dùng bản gốc */
export function pickFile(
  doc: { locale: string; fileUrl: string | null; previewUrl: string | null; mimeType: string | null; variants: { locale: string; fileUrl: string; previewUrl: string | null; mimeType: string | null }[] },
  lang: string | null,
  variant: "original" | "preview",
) {
  const v = lang && lang !== doc.locale ? doc.variants.find((x) => x.locale === lang) : undefined;
  const src = v ?? doc;
  const key = variant === "preview" ? src.previewUrl : src.fileUrl;
  return { key, mime: variant === "preview" ? "application/pdf" : src.mimeType, suffix: v ? ` (${v.locale})` : "" };
}
