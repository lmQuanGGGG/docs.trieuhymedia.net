import "server-only";
import type { Member } from "@prisma/client";
import { hashPassword } from "@/server/auth/password";
import { db } from "@/server/db";
import { ApiError } from "@/server/http";
import { roleFromDto } from "@/server/mappers";
import { assert, atLeast, isAdmin } from "@/server/permissions";
import type { Role } from "@/types";
import { logActivity } from "./activity";

const PALETTE = ["#3F6E6A", "#B7791F", "#C2603A", "#6B7A3A", "#52525B", "#B4536A"];

/** Chỉ Super Admin được gán/đụng tới Super Admin */
function guardTarget(me: Member, targetRole: Member["role"], nextRole?: Member["role"]) {
  assert(isAdmin(me));
  if (targetRole === "SUPER_ADMIN" || nextRole === "SUPER_ADMIN") assert(atLeast(me, "SUPER_ADMIN"));
}

/** Admin tạo tài khoản kèm mật khẩu tạm; nhân viên phải tự đổi ở lần đăng nhập đầu */
export async function createMember(me: Member, input: { name: string; email: string; role: Role; title?: string; password: string }) {
  const role = roleFromDto[input.role];
  guardTarget(me, "VIEWER", role);
  const email = input.email.toLowerCase();
  if (await db.member.findUnique({ where: { email } })) throw new ApiError("conflict", "email exists");
  const count = await db.member.count();
  const member = await db.member.create({
    data: {
      name: input.name,
      email,
      role,
      title: input.title || null,
      status: "ACTIVE",
      color: PALETTE[count % PALETTE.length],
      passwordHash: await hashPassword(input.password),
      mustChangePassword: true,
    },
  });
  await logActivity({ actorId: me.id, action: "INVITED", targetType: "member", targetName: email, metadata: { role } });
  return member;
}

/** Admin đặt lại mật khẩu tạm (khi nhân viên quên); cũng mở khoá tài khoản đang tạm khoá */
export async function resetPassword(me: Member, memberId: string, password: string) {
  assert(memberId !== me.id);
  const target = await db.member.findUnique({ where: { id: memberId } });
  if (!target) throw new ApiError("not_found");
  guardTarget(me, target.role);
  await db.member.update({
    where: { id: memberId },
    data: { passwordHash: await hashPassword(password), mustChangePassword: true, status: "ACTIVE" },
  });
}

export async function changeRole(me: Member, memberId: string, role: Role) {
  assert(memberId !== me.id);
  const target = await db.member.findUnique({ where: { id: memberId } });
  if (!target) throw new ApiError("not_found");
  guardTarget(me, target.role, roleFromDto[role]);
  await db.member.update({ where: { id: memberId }, data: { role: roleFromDto[role] } });
}

/** Gỡ thành viên: chuyển SUSPENDED (giữ lịch sử, tài liệu sở hữu không bị mất) */
export async function removeMember(me: Member, memberId: string) {
  assert(memberId !== me.id);
  const target = await db.member.findUnique({ where: { id: memberId } });
  if (!target) throw new ApiError("not_found");
  guardTarget(me, target.role);
  if (target.status === "INVITED") {
    await db.invitation.deleteMany({ where: { email: target.email, acceptedAt: null } });
    const owns = await db.document.count({ where: { ownerId: target.id } });
    if (owns === 0) {
      await db.member.delete({ where: { id: target.id } });
      return;
    }
  }
  await db.member.update({ where: { id: memberId }, data: { status: "SUSPENDED" } });
}

export async function markNotificationsRead(me: Member) {
  await db.member.update({ where: { id: me.id }, data: { notificationsReadAt: new Date() } });
}
