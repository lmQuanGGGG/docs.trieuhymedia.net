import { requireMember } from "@/server/auth/session";
import { handle, ok } from "@/server/http";
import { setStars } from "@/server/services/documents";
import { starBody } from "@/server/validation";

export const POST = handle(async (req: Request) => {
  const me = await requireMember();
  const { ids, starred } = starBody.parse(await req.json());
  await setStars(me, ids, starred);
  return ok({ ok: true });
});
