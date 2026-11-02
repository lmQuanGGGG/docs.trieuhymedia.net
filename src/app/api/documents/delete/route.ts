import { requireMember } from "@/server/auth/session";
import { handle, ok } from "@/server/http";
import { deleteDocuments } from "@/server/services/documents";
import { idsBody } from "@/server/validation";

export const POST = handle(async (req: Request) => {
  const me = await requireMember();
  const { ids } = idsBody.parse(await req.json());
  return ok({ deleted: await deleteDocuments(me, ids) });
});
