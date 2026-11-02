import { requireMember } from "@/server/auth/session";
import { handle, ok } from "@/server/http";
import { changeRole, removeMember } from "@/server/services/members";
import { roleBody } from "@/server/validation";

export const PATCH = handle(async (req: Request, ctx: RouteContext<"/api/members/[id]">) => {
  const me = await requireMember();
  const { id } = await ctx.params;
  await changeRole(me, id, roleBody.parse(await req.json()).role);
  return ok({ ok: true });
});

export const DELETE = handle(async (_req: Request, ctx: RouteContext<"/api/members/[id]">) => {
  const me = await requireMember();
  const { id } = await ctx.params;
  await removeMember(me, id);
  return ok({ ok: true });
});
