import "server-only";
import type { Member } from "@prisma/client";
import { cookies } from "next/headers";
import { cache } from "react";
import { db } from "@/server/db";
import { serverEnv } from "@/server/env";
import { ApiError } from "@/server/http";
import { readSession, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, signSession } from "@/lib/session-token";

export async function startSession(memberId: string): Promise<void> {
  const token = await signSession(memberId, serverEnv.authSecret);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function endSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

/** Thành viên đang đăng nhập (đã xác thực chữ ký + còn ACTIVE trong DB), cache theo request */
export const getCurrentMember = cache(async (): Promise<Member | null> => {
  const session = await readSession((await cookies()).get(SESSION_COOKIE)?.value, serverEnv.authSecret);
  if (!session) return null;
  const member = await db.member.findUnique({ where: { id: session.sub } });
  return member && member.status === "ACTIVE" ? member : null;
});

/**
 * Bắt buộc đăng nhập. Tài khoản đang dùng mật khẩu tạm bị chặn mọi API,
 * trừ API đổi mật khẩu (allowPasswordChange).
 */
export async function requireMember(opts: { allowPasswordChange?: boolean } = {}): Promise<Member> {
  const member = await getCurrentMember();
  if (!member) throw new ApiError("unauthorized");
  if (member.mustChangePassword && !opts.allowPasswordChange) throw new ApiError("forbidden", "password_change_required");
  return member;
}
