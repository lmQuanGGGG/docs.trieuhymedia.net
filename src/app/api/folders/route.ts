import { requireMember } from "@/server/auth/session";
import { handle, ok } from "@/server/http";
import { createFolder } from "@/server/services/folders";
import { folderBody } from "@/server/validation";

export const POST = handle(async (req: Request) => {
  const me = await requireMember();
  return ok(await createFolder(me, folderBody.parse(await req.json())), { status: 201 });
});
