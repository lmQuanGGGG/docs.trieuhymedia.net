import { endSession } from "@/server/auth/session";
import { handle, ok } from "@/server/http";

export const POST = handle(async () => {
  await endSession();
  return ok({ ok: true });
});
