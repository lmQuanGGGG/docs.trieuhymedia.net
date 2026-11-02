import { requireMember } from "@/server/auth/session";
import { handle, ok } from "@/server/http";
import { resetPassword } from "@/server/services/members";
import { resetPasswordBody } from "@/server/validation";

export const POST = handle(async (req: Request, ctx: RouteContext<"/api/members/[id]/password">) => {
  const me = await requireMember();
  const { id } = await ctx.params;
  await resetPassword(me, id, resetPasswordBody.parse(await req.json()).password);
  return ok({ ok: true });
});
