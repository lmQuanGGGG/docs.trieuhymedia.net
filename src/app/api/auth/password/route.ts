import { requireMember } from "@/server/auth/session";
import { handle, ok } from "@/server/http";
import { changeOwnPassword } from "@/server/services/account";
import { changePasswordBody } from "@/server/validation";

export const POST = handle(async (req: Request) => {
  const me = await requireMember({ allowPasswordChange: true });
  const { currentPassword, newPassword } = changePasswordBody.parse(await req.json());
  await changeOwnPassword(me, currentPassword, newPassword);
  return ok({ ok: true });
});
