import "server-only";
import type { Member } from "@prisma/client";
import type { WorkspaceSnapshot } from "@/lib/api/types";
import { db } from "@/server/db";
import { actionToDto, initialsOf, roleToDto } from "@/server/mappers";
import { canDelete, canEdit, canShare, isAdmin, viewableWhere } from "@/server/permissions";
import { documentInclude, toDocumentDto } from "./serialize";

const NOTIFICATION_LIMIT = 10;
const ACTIVITY_LIMIT = 60;

export async function getWorkspaceSnapshot(me: Member): Promise<WorkspaceSnapshot> {
  const [docs, folders, members, activities] = await Promise.all([
    db.document.findMany({
      where: { deletedAt: null, ...viewableWhere(me) },
      include: documentInclude,
      orderBy: { updatedAt: "desc" },
    }),
    db.folder.findMany({ orderBy: { createdAt: "asc" } }),
    db.member.findMany({ orderBy: { createdAt: "asc" } }),
    db.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: ACTIVITY_LIMIT }),
  ]);

  const visibleIds = new Set(docs.map((d) => d.id));
  // Chỉ hiện hoạt động của tài liệu người này được xem; hoạt động quản trị (mời…) chỉ admin thấy
  const visibleActivities = activities.filter((a) =>
    a.documentId ? visibleIds.has(a.documentId) : a.targetType === "document" || isAdmin(me),
  );

  return {
    currentUserId: me.id,
    documents: docs.map((d) =>
      toDocumentDto(d, me.id, {}, { edit: canEdit(me, d), delete: canDelete(me, d), share: canShare(me, d) }),
    ),
    folders: folders.map((f) => ({
      id: f.id,
      name: f.name,
      brand: (f.brand ?? "Triệu Hỷ Media") as WorkspaceSnapshot["folders"][number]["brand"],
      parentId: f.parentId,
      color: f.color ?? "#71717A",
    })),
    members: members.map((m) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      role: roleToDto[m.role],
      status: m.status === "ACTIVE" ? "active" : m.status === "INVITED" ? "invited" : "suspended",
      title: m.title ?? "",
      initials: initialsOf(m.name),
      color: m.color ?? "#71717A",
      lastActiveAt: (m.lastActiveAt ?? m.createdAt).toISOString(),
    })),
    activities: visibleActivities.map((a) => ({
      id: a.id,
      actorId: a.actorId,
      action: actionToDto[a.action],
      documentId: a.documentId && visibleIds.has(a.documentId) ? a.documentId : undefined,
      targetName: a.targetName ?? "",
      createdAt: a.createdAt.toISOString(),
    })),
    notifications: visibleActivities
      .filter((a) => a.actorId !== me.id)
      .slice(0, NOTIFICATION_LIMIT)
      .map((a) => ({
        id: a.id,
        actorId: a.actorId,
        action: actionToDto[a.action],
        targetName: a.targetName ?? "",
        createdAt: a.createdAt.toISOString(),
        read: !!me.notificationsReadAt && a.createdAt <= me.notificationsReadAt,
      })),
  };
}
