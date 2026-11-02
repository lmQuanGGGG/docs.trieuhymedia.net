import "server-only";
import type { Member } from "@prisma/client";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import { db } from "@/server/db";
import { ApiError } from "@/server/http";

/** Nhân viên tự đổi mật khẩu; phải nhập đúng mật khẩu hiện tại */
export async function changeOwnPassword(me: Member, currentPassword: string, newPassword: string) {
  if (!me.passwordHash || !(await verifyPassword(currentPassword, me.passwordHash))) {
    throw new ApiError("forbidden", "wrong password");
  }
  if (currentPassword === newPassword) throw new ApiError("bad_request", "same password");
  await db.member.update({
    where: { id: me.id },
    data: { passwordHash: await hashPassword(newPassword), mustChangePassword: false },
  });
}
