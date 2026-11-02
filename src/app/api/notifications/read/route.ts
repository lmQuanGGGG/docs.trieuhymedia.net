import { requireMember } from "@/server/auth/session";
import { handle, ok } from "@/server/http";
import { markNotificationsRead } from "@/server/services/members";

export const POST = handle(async () => {
  await markNotificationsRead(await requireMember());
  return ok({ ok: true });
});
