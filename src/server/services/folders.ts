import "server-only";
import type { Member } from "@prisma/client";
import { db } from "@/server/db";
import { assert, canCreate } from "@/server/permissions";
import type { Brand } from "@/types";
import { logActivity } from "./activity";

export async function createFolder(me: Member, input: { name: string; brand: Brand }) {
  assert(canCreate(me));
  const parent = await db.folder.findFirst({ where: { parentId: null, brand: input.brand } });
  const folder = await db.folder.create({
    data: { name: input.name, brand: input.brand, parentId: parent?.id ?? null, color: parent?.color ?? "#4CAF50", createdById: me.id },
  });
  await logActivity({ actorId: me.id, action: "CREATED", targetType: "folder", targetName: folder.name });
  return folder;
}
