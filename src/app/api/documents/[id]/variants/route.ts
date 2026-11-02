import { requireMember } from "@/server/auth/session";
import { ApiError, handle, ok } from "@/server/http";
import { upsertVariant } from "@/server/services/documents";

/** multipart/form-data: file + locale */
export const POST = handle(async (req: Request, ctx: RouteContext<"/api/documents/[id]/variants">) => {
  const me = await requireMember();
  const { id } = await ctx.params;
  const form = await req.formData();
  const file = form.get("file");
  const locale = form.get("locale");
  if (!(file instanceof File) || typeof locale !== "string") throw new ApiError("bad_request");
  return ok(await upsertVariant(me, id, locale, file));
});
