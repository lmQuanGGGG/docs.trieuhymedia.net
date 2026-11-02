import { requireMember } from "@/server/auth/session";
import { handle, ok } from "@/server/http";
import { deleteCollection, updateCollection } from "@/server/services/collections";
import { collectionBody } from "@/server/validation";

export const PATCH = handle(async (req: Request, ctx: RouteContext<"/api/collections/[id]">) => {
  const me = await requireMember();
  const { id } = await ctx.params;
  return ok(await updateCollection(me, id, collectionBody.parse(await req.json())));
});

export const DELETE = handle(async (_req: Request, ctx: RouteContext<"/api/collections/[id]">) => {
  const me = await requireMember();
  const { id } = await ctx.params;
  await deleteCollection(me, id);
  return ok({ ok: true });
});
