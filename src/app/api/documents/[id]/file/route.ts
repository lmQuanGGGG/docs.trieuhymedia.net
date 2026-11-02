import { requireMember } from "@/server/auth/session";
import { fileResponse } from "@/server/file-response";
import { ApiError, handle } from "@/server/http";
import { logActivity } from "@/server/services/activity";
import { loadDocument } from "@/server/services/documents";

export const GET = handle(async (req: Request, ctx: RouteContext<"/api/documents/[id]/file">) => {
  const me = await requireMember();
  const { id } = await ctx.params;
  const url = new URL(req.url);
  const variant = url.searchParams.get("variant") === "preview" ? "preview" : "original";
  const download = url.searchParams.get("download") === "1";
  const doc = await loadDocument(me, id);
  const key = variant === "preview" ? doc.previewUrl : doc.fileUrl;
  if (!key) throw new ApiError("not_found");
  if (download) {
    await logActivity({ actorId: me.id, action: "DOWNLOADED", targetType: "document", targetName: doc.title, documentId: doc.id });
  }
  return fileResponse(key, { title: doc.title, mime: variant === "preview" ? "application/pdf" : doc.mimeType, download });
});
