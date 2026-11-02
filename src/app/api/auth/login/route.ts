import { verifyPassword } from "@/server/auth/password";
import { startSession } from "@/server/auth/session";
import { db } from "@/server/db";
import { ApiError, handle, ok } from "@/server/http";
import { loginBody } from "@/server/validation";

export const POST = handle(async (req: Request) => {
  const { email, password } = loginBody.parse(await req.json());
  const member = await db.member.findUnique({ where: { email: email.toLowerCase() } });
  // Cùng một thông báo cho mọi trường hợp sai để không lộ email nào tồn tại
  const valid = member?.passwordHash && member.status === "ACTIVE" && (await verifyPassword(password, member.passwordHash));
  if (!member || !valid) throw new ApiError("unauthorized", "invalid credentials");
  await db.member.update({ where: { id: member.id }, data: { lastActiveAt: new Date() } });
  await startSession(member.id);
  return ok({ ok: true });
});
