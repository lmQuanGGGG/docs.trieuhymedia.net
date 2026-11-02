"use client";

import { Download, FilePlus2, MessageSquare, Pencil, Share2, Trash2, UserPlus, type LucideIcon, FileEdit } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { MemberAvatar } from "@/components/shared/member-avatar";
import { PageHeader } from "@/components/shared/page-header";
import { Link } from "@/i18n/navigation";
import { useNow } from "@/lib/use-now";
import { useWorkspace } from "@/lib/store/workspace-store";
import { type ActivityAction, activityActions } from "@/types";

const actionIcon: Record<ActivityAction, LucideIcon> = {
  created: FilePlus2,
  updated: FileEdit,
  shared: Share2,
  downloaded: Download,
  renamed: Pencil,
  deleted: Trash2,
  commented: MessageSquare,
  invited: UserPlus,
};

const DAY_MS = 24 * 60 * 60 * 1000;

function dayKey(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(iso));
}

export function ActivityView() {
  const t = useTranslations();
  const format = useFormatter();
  const { activities, getMember, getDocument, status } = useWorkspace();
  const [filter, setFilter] = useState<ActivityAction | "all">("all");

  const now = useNow();
  const today = dayKey(new Date(now).toISOString());
  const yesterday = dayKey(new Date(now - DAY_MS).toISOString());
  const items = activities.filter((a) => filter === "all" || a.action === filter);
  const groups = [
    { label: t("activity.today"), items: items.filter((a) => dayKey(a.createdAt) === today) },
    { label: t("activity.yesterday"), items: items.filter((a) => dayKey(a.createdAt) === yesterday) },
    { label: t("activity.earlier"), items: items.filter((a) => dayKey(a.createdAt) !== today && dayKey(a.createdAt) !== yesterday) },
  ].filter((g) => g.items.length > 0);

  return (
    <div className="grid grid-cols-1 gap-6">
      <PageHeader
        title={t("activity.title")}
        description={t("activity.description")}
        actions={
          <Select value={filter} onValueChange={(v) => setFilter(v as ActivityAction | "all")}>
            <SelectTrigger className="min-w-48 rounded-lg border-transparent bg-card shadow-soft" aria-label={t("activity.filterAll")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="all">{t("activity.filterAll")}</SelectItem>
              {activityActions.map((a) => (
                <SelectItem key={a} value={a}>{t(`activity.verbs.${a}`)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {status === "loading" ? (
        <div className="surface grid gap-5 p-5">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="size-9 rounded-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="surface p-10 text-center text-sm text-muted-foreground">{t("activity.empty")}</div>
      ) : (
        groups.map((g) => (
          <section key={g.label}>
            <h2 className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">{g.label}</h2>
            <ol className="surface">
              {g.items.map((a) => {
                const actor = getMember(a.actorId);
                const Icon = actionIcon[a.action];
                const doc = a.documentId ? getDocument(a.documentId) : undefined;
                return (
                  <li key={a.id} className="flex gap-3 p-4 shadow-[inset_0_-1px_0_var(--border)] last:shadow-none sm:items-center">
                    <span className="relative">
                      <MemberAvatar member={actor} size="md" />
                      <span className="absolute -right-1 -bottom-1 grid size-5 place-items-center rounded-full bg-card shadow-soft">
                        <Icon className="size-3 text-brand" />
                      </span>
                    </span>
                    <div className="min-w-0 flex-1 text-sm sm:flex sm:items-center sm:justify-between sm:gap-4">
                      <p className="text-pretty">
                        <span className="font-medium">{actor?.name}</span>{" "}
                        <span className="text-muted-foreground">{t(`activity.verbs.${a.action}`)}</span>{" "}
                        {doc ? (
                          <Link href={`/documents/${doc.id}`} className="font-medium hover:text-brand hover:underline">{doc.title}</Link>
                        ) : (
                          <span className="font-medium">{a.targetName}</span>
                        )}
                      </p>
                      <time dateTime={a.createdAt} className="mt-0.5 block shrink-0 text-xs text-muted-foreground sm:mt-0">
                        {format.dateTime(new Date(a.createdAt), { dateStyle: "medium", timeStyle: "short" })}
                      </time>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        ))
      )}
    </div>
  );
}
