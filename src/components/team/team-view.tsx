"use client";

import { Check, KeyRound, Mail, MoreHorizontal, ShieldAlert, UserMinus, UserPlus, X } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MemberAvatar } from "@/components/shared/member-avatar";
import { PageHeader } from "@/components/shared/page-header";
import { useWorkspace } from "@/lib/store/workspace-store";
import { useApiErrorToast } from "@/lib/use-api-error";
import { cn } from "@/lib/utils";
import { type Member, type MemberStatus, type Role, roles } from "@/types";
import { InviteDialog } from "./invite-dialog";
import { ResetPasswordDialog } from "./reset-password-dialog";

const permissionKeys = ["view", "download", "edit", "share", "delete", "members", "settings"] as const;
type PermissionKey = (typeof permissionKeys)[number];

/** Ma trận quyền tham khảo cho UI — backend mới là nơi thực thi */
const matrix: Record<Role, PermissionKey[]> = {
  superAdmin: [...permissionKeys],
  admin: ["view", "download", "edit", "share", "delete", "members", "settings"],
  editor: ["view", "download", "edit", "share"],
  viewer: ["view", "download"],
  guest: ["view"],
};

const statusStyle: Record<MemberStatus, string> = {
  active: "bg-success/12 text-success",
  invited: "bg-warning/12 text-warning",
  suspended: "bg-muted text-muted-foreground",
};

function MemberRowActions({ member, onResetPassword }: { member: Member; onResetPassword: () => void }) {
  const t = useTranslations();
  const { setRole, removeMember, currentUserId } = useWorkspace();
  const showError = useApiErrorToast();
  const isSelf = member.id === currentUserId;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`${t("common.more")}: ${member.name}`} className="text-muted-foreground">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{t("team.changeRole")}</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={member.role}
          onValueChange={async (value) => {
            const role = value as Role;
            try {
              await setRole(member.id, role);
              toast.success(t("team.roleChanged", { name: member.name, role: t(`roles.${role}`) }));
            } catch (error) {
              showError(error);
            }
          }}
        >
          {roles.map((r) => (
            <DropdownMenuRadioItem key={r} value={r} disabled={isSelf}>
              {t(`roles.${r}`)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onResetPassword}>
          <KeyRound /> {t("team.resetPassword")}
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          disabled={isSelf}
          onSelect={async () => {
            try {
              await removeMember(member.id);
              toast.success(t("team.removed", { name: member.name }));
            } catch (error) {
              showError(error);
            }
          }}
        >
          <UserMinus /> {t("team.remove")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function TeamView() {
  const t = useTranslations();
  const format = useFormatter();
  const { members, documents, status, removeMember, currentUser, currentUserId } = useWorkspace();
  const showError = useApiErrorToast();
  const canManage = currentUser?.role === "admin" || currentUser?.role === "superAdmin";
  const [inviteOpen, setInviteOpen] = useState(false);
  const [resetFor, setResetFor] = useState<Member | null>(null);
  const active = members.filter((m) => m.status !== "invited");
  const invited = members.filter((m) => m.status === "invited");
  const owned = (id: string) => documents.filter((d) => d.ownerId === id).length;

  return (
    <div className="grid grid-cols-1 gap-6">
      <PageHeader
        title={t("team.title")}
        description={t("team.description")}
        actions={
          canManage ? (
            <Button onClick={() => setInviteOpen(true)}>
              <UserPlus /> {t("team.createAccount")}
            </Button>
          ) : null
        }
      />

      <Tabs defaultValue="members" className="gap-4">
        <TabsList className="w-full justify-start overflow-x-auto scrollbar-none sm:w-fit">
          <TabsTrigger value="members">{t("team.tabs.members")}</TabsTrigger>
          <TabsTrigger value="invitations">
            {t("team.tabs.invitations")}
            {invited.length ? <span className="ml-1.5 rounded-full bg-brand-soft px-1.5 text-[11px] text-brand">{invited.length}</span> : null}
          </TabsTrigger>
          <TabsTrigger value="roles">{t("team.tabs.roles")}</TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <div className="surface overflow-hidden">
            <table className="w-full table-fixed text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground">
                  <th scope="col" className="h-10 px-4 font-medium">{t("team.columns.member")}</th>
                  <th scope="col" className="hidden h-10 w-40 px-3 font-medium sm:table-cell">{t("team.columns.role")}</th>
                  <th scope="col" className="hidden h-10 w-36 px-3 font-medium md:table-cell">{t("team.columns.status")}</th>
                  <th scope="col" className="hidden h-10 w-32 px-3 font-medium lg:table-cell">{t("team.columns.documents")}</th>
                  <th scope="col" className="hidden h-10 w-40 px-3 font-medium xl:table-cell">{t("team.columns.lastActive")}</th>
                  <th scope="col" className="h-10 w-12 px-3"><span className="sr-only">{t("team.columns.actions")}</span></th>
                </tr>
              </thead>
              <tbody>
                {status === "loading"
                  ? Array.from({ length: 5 }, (_, i) => (
                      <tr key={i} className="shadow-[inset_0_1px_0_var(--border)]">
                        <td className="h-16 px-4" colSpan={6}>
                          <div className="flex items-center gap-3">
                            <Skeleton className="size-9 rounded-full" />
                            <Skeleton className="h-4 w-48" />
                          </div>
                        </td>
                      </tr>
                    ))
                  : active.map((m) => (
                      <tr key={m.id} className="shadow-[inset_0_1px_0_var(--border)] transition-colors hover:bg-muted/40">
                        <td className="h-16 px-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <MemberAvatar member={m} size="md" />
                            <div className="min-w-0">
                              <p className="truncate font-medium">
                                {m.name}
                                {m.id === currentUserId ? <span className="ml-1.5 text-xs font-normal text-muted-foreground">({t("common.you")})</span> : null}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">{m.email}</p>
                              <p className="truncate text-xs text-muted-foreground sm:hidden">{t(`roles.${m.role}`)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="hidden px-3 sm:table-cell">
                          <span className={cn("text-sm", (m.role === "superAdmin" || m.role === "admin") && "font-medium text-brand")}>
                            {t(`roles.${m.role}`)}
                          </span>
                        </td>
                        <td className="hidden px-3 md:table-cell">
                          <span className={cn("inline-flex h-6 items-center rounded-full px-2.5 text-xs font-medium", statusStyle[m.status])}>
                            {t(`memberStatus.${m.status}`)}
                          </span>
                        </td>
                        <td className="hidden px-3 text-muted-foreground tabular-nums lg:table-cell">{t("common.documentsCount", { count: owned(m.id) })}</td>
                        <td className="hidden px-3 text-muted-foreground xl:table-cell">
                          {format.dateTime(new Date(m.lastActiveAt), { dateStyle: "medium", timeStyle: "short" })}
                        </td>
                        <td className="px-3 text-right">
                          {canManage && m.id !== currentUserId ? <MemberRowActions member={m} onResetPassword={() => setResetFor(m)} /> : null}
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="invitations">
          <div className="surface">
            {invited.length === 0 ? (
              <p className="p-8 text-center text-sm text-muted-foreground">{t("team.noInvitations")}</p>
            ) : (
              <ul>
                {invited.map((m) => (
                  <li key={m.id} className="flex flex-col gap-3 p-4 shadow-[inset_0_-1px_0_var(--border)] last:shadow-none sm:flex-row sm:items-center">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <span className="grid size-9 place-items-center rounded-full bg-muted text-muted-foreground"><Mail className="size-4" /></span>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{m.email}</p>
                        <p className="text-xs text-muted-foreground">{t(`roles.${m.role}`)} · {m.name}</p>
                      </div>
                    </div>
                    <div className={cn("flex gap-2", !canManage && "hidden")}>
                      <Button variant="secondary" size="sm" onClick={() => toast.info(t("team.inviteResent"))}>
                        {t("team.resend")}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={async () => {
                          try {
                            await removeMember(m.id);
                            toast.success(t("team.inviteRevoked", { email: m.email }));
                          } catch (error) {
                            showError(error);
                          }
                        }}
                      >
                        {t("team.revoke")}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </TabsContent>

        <TabsContent value="roles" className="grid gap-4">
          <div className="surface overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground">
                  <th scope="col" className="h-12 px-4 font-medium">{t("team.permission")}</th>
                  {roles.map((r) => (
                    <th key={r} scope="col" className="h-12 px-3 text-center font-medium">{t(`roles.${r}`)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {permissionKeys.map((p) => (
                  <tr key={p} className="shadow-[inset_0_1px_0_var(--border)]">
                    <th scope="row" className="h-12 px-4 text-left font-normal">{t(`team.permissions.${p}`)}</th>
                    {roles.map((r) => (
                      <td key={r} className="px-3 text-center">
                        {matrix[r].includes(p) ? (
                          <Check className="mx-auto size-4 text-success" aria-label="✓" />
                        ) : (
                          <X className="mx-auto size-4 text-muted-foreground/40" aria-label="—" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {roles.map((r) => (
              <div key={r} className="surface p-4">
                <p className="text-sm font-medium">{t(`roles.${r}`)}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t(`roles.${r}Description`)}</p>
              </div>
            ))}
          </div>
          <p className="flex gap-2 rounded-xl bg-brand-soft px-4 py-3 text-sm">
            <ShieldAlert className="mt-0.5 size-4 shrink-0 text-brand" />
            {t("team.securityNotice")}
          </p>
        </TabsContent>
      </Tabs>

      <InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} />
      <ResetPasswordDialog member={resetFor} onOpenChange={(v) => !v && setResetFor(null)} />
    </div>
  );
}
