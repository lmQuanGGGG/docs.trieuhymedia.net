import { requireMember } from "@/server/auth/session";
import { handle, ok } from "@/server/http";
import { createCollection, listCollections } from "@/server/services/collections";
import { collectionBody } from "@/server/validation";

export const GET = handle(async () => ok(await listCollections(await requireMember())));

export const POST = handle(async (req: Request) => {
  const me = await requireMember();
  return ok(await createCollection(me, collectionBody.parse(await req.json())), { status: 201 });
});
