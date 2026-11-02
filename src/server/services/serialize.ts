import "server-only";
import type { Prisma } from "@prisma/client";
import { categoryToDto, statusToDto, typeToDto, visibilityToDto } from "@/server/mappers";
import type { DocumentItem, DocumentType } from "@/types";

function variantType(key: string, mime: string | null): DocumentType {
  const k = key.toLowerCase();
  if (k.endsWith(".pdf")) return "pdf";
  if (k.endsWith(".docx") || k.endsWith(".doc")) return "docx";
  if (k.endsWith(".pptx") || k.endsWith(".ppt")) return "pptx";
  if (k.endsWith(".xlsx") || k.endsWith(".xls") || k.endsWith(".csv")) return "xlsx";
  if (mime?.startsWith("image/")) return "image";
  return "pdf";
}

export const documentInclude = {
  versions: { orderBy: { version: "desc" } },
  variants: { orderBy: { locale: "asc" } },
  stars: { select: { memberId: true } },
  accesses: { select: { memberId: true, permission: true } },
  shareLinks: { where: { isActive: true }, select: { token: true }, take: 1, orderBy: { createdAt: "desc" } },
} satisfies Prisma.DocumentInclude;

export type DocumentRow = Prisma.DocumentGetPayload<{ include: typeof documentInclude }>;

/** URL tệp đi qua API có kiểm quyền; không bao giờ lộ đường dẫn trên đĩa */
export function toDocumentDto(
  row: DocumentRow,
  memberId: string,
  urls: { file?: string; preview?: string } = {},
  can?: DocumentItem["can"],
): DocumentItem {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    type: typeToDto[row.type],
    category: categoryToDto[row.category],
    brand: row.brand as DocumentItem["brand"],
    folderId: row.folderId,
    ownerId: row.ownerId,
    status: statusToDto[row.status],
    visibility: visibilityToDto[row.visibility],
    starred: row.stars.some((s) => s.memberId === memberId),
    sharedWithMe: row.ownerId !== memberId && row.accesses.some((a) => a.memberId === memberId),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    sizeBytes: Number(row.sizeBytes ?? 0),
    pages: row.pages ?? undefined,
    tags: row.tags,
    fileUrl: row.fileUrl ? (urls.file ?? `/api/documents/${row.id}/file`) : undefined,
    previewUrl: row.previewUrl ? (urls.preview ?? `/api/documents/${row.id}/file?variant=preview`) : undefined,
    externalUrl: row.externalUrl ?? undefined,
    versions: row.versions.map((v) => ({
      version: v.version,
      note: v.note ?? "",
      authorId: v.createdById,
      createdAt: v.createdAt.toISOString(),
      sizeBytes: Number(v.sizeBytes),
    })),
    shareToken: row.shareLinks[0]?.token,
    locale: row.locale,
    variants: row.variants.map((v) => ({
      locale: v.locale,
      type: variantType(v.fileUrl, v.mimeType),
      sizeBytes: Number(v.sizeBytes),
      hasPreview: !!v.previewUrl,
      updatedAt: v.updatedAt.toISOString(),
    })),
    can,
  };
}
