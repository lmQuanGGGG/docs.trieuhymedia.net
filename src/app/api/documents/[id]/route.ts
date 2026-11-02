import { requireMember } from "@/server/auth/session";
import { handle, ok } from "@/server/http";
import { deleteDocuments, updateDocument } from "@/server/services/documents";
import { updateDocumentBody } from "@/server/validation";

export const PATCH = handle(async (req: Request, ctx: RouteContext<"/api/documents/[id]">) => {
  const me = await requireMember();
  const { id } = await ctx.params;
  return ok(await updateDocument(me, id, updateDocumentBody.parse(await req.json())));
});

export const DELETE = handle(async (_req: Request, ctx: RouteContext<"/api/documents/[id]">) => {
  const me = await requireMember();
  const { id } = await ctx.params;
  return ok({ deleted: await deleteDocuments(me, [id]) });
});
