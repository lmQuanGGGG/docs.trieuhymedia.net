import { requireMember } from "@/server/auth/session";
import { handle, ok } from "@/server/http";
import { getShareSettings, upsertShareSettings } from "@/server/services/share";
import { shareBody } from "@/server/validation";

export const GET = handle(async (_req: Request, ctx: RouteContext<"/api/documents/[id]/share">) => {
  const me = await requireMember();
  const { id } = await ctx.params;
  return ok(await getShareSettings(me, id));
});

export const PUT = handle(async (req: Request, ctx: RouteContext<"/api/documents/[id]/share">) => {
  const me = await requireMember();
  const { id } = await ctx.params;
  return ok(await upsertShareSettings(me, id, shareBody.parse(await req.json())));
});
