import { requireMember } from "@/server/auth/session";
import { handle, ok } from "@/server/http";
import { getWorkspaceSnapshot } from "@/server/services/workspace";

export const GET = handle(async () => ok(await getWorkspaceSnapshot(await requireMember())));
