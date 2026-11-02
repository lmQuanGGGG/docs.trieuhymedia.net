import { requireMember } from "@/server/auth/session";
import { handle, ok } from "@/server/http";
import { createMember } from "@/server/services/members";
import { createMemberBody } from "@/server/validation";

export const POST = handle(async (req: Request) => {
  const me = await requireMember();
  const member = await createMember(me, createMemberBody.parse(await req.json()));
  return ok({ id: member.id }, { status: 201 });
});
