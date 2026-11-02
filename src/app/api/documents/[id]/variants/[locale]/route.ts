import { requireMember } from "@/server/auth/session";
import { handle, ok } from "@/server/http";
import { deleteVariant } from "@/server/services/documents";

export const DELETE = handle(async (_req: Request, ctx: RouteContext<"/api/documents/[id]/variants/[locale]">) => {
  const me = await requireMember();
  const { id, locale } = await ctx.params;
  return ok(await deleteVariant(me, id, locale));
});
