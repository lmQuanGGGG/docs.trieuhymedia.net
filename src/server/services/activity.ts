import "server-only";
import type { ActivityAction, Prisma } from "@prisma/client";
import { db } from "@/server/db";

export async function logActivity(input: {
  actorId: string;
  action: ActivityAction;
  targetType: "document" | "folder" | "member" | "share_link";
  targetName: string;
  documentId?: string | null;
  metadata?: Prisma.InputJsonValue;
}): Promise<void> {
  await db.activityLog.create({
    data: {
      actorId: input.actorId,
      action: input.action,
      targetType: input.targetType,
      targetName: input.targetName,
      documentId: input.documentId ?? null,
      metadata: input.metadata ?? {},
    },
  });
}
