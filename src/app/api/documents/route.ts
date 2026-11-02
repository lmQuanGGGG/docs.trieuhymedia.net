import { requireMember } from "@/server/auth/session";
import { ApiError, handle, ok } from "@/server/http";
import { createDocument } from "@/server/services/documents";
import { createDocumentFields } from "@/server/validation";

/** multipart/form-data: file (tuỳ chọn) + các trường thông tin */
export const POST = handle(async (req: Request) => {
  const me = await requireMember();
  const form = await req.formData();
  const fields = createDocumentFields.parse({
    title: form.get("title"),
    category: form.get("category"),
    brand: form.get("brand"),
    visibility: form.get("visibility"),
    type: form.get("type") || undefined,
    url: form.get("url") || undefined,
    folderId: form.get("folderId") || undefined,
  });
  const file = form.get("file");
  if (file !== null && !(file instanceof File)) throw new ApiError("bad_request");
  if (!file && fields.type === "link" && !fields.url) throw new ApiError("bad_request", "url required");
  const doc = await createDocument(me, {
    ...fields,
    externalUrl: fields.url,
    file: file ?? undefined,
  });
  return ok(doc, { status: 201 });
});
