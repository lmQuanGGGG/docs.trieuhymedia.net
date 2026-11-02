import { requireMember } from "@/server/auth/session";
import { ApiError, handle, ok } from "@/server/http";
import { createDocumentFromStream } from "@/server/services/documents";
import { createDocumentFields } from "@/server/validation";

/**
 * Upload dạng stream: thân request là nội dung tệp, thông tin tài liệu ở query,
 * tên tệp ở header X-File-Name (đã encodeURIComponent). Không giới hạn bởi RAM.
 */
export const POST = handle(async (req: Request) => {
  const me = await requireMember();
  const url = new URL(req.url);
  const fields = createDocumentFields.parse({
    title: url.searchParams.get("title"),
    category: url.searchParams.get("category"),
    brand: url.searchParams.get("brand"),
    visibility: url.searchParams.get("visibility"),
    folderId: url.searchParams.get("folderId") || undefined,
  });
  const rawName = req.headers.get("x-file-name");
  if (!rawName || !req.body) throw new ApiError("bad_request", "missing file");
  const doc = await createDocumentFromStream(me, fields, {
    name: decodeURIComponent(rawName),
    mime: req.headers.get("content-type") ?? "",
    body: req.body,
  });
  return ok(doc, { status: 201 });
});
