"use client";

import { Check, Copy, ExternalLink, Eye, Lock, MoreHorizontal, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { SITE_URL } from "@/config/site";
import { api, type CollectionInput } from "@/lib/api";
import { useWorkspace } from "@/lib/store/workspace-store";
import { useApiErrorToast } from "@/lib/use-api-error";
import { cn } from "@/lib/utils";
import type { ShareCollectionItem } from "@/types";
import { CollectionDialog } from "./collection-dialog";

/** Danh sách bộ chia sẻ: một link chứa nhiều tài liệu cho đối tác */
export function CollectionsView() {
  const t = useTranslations("collections");
  const format = useFormatter();
  const locale = useLocale();
  const showError = useApiErrorToast();
  const { canCreate } = useWorkspace();
  const [items, setItems] = useState<ShareCollectionItem[] | null>(null);
  const [editing, setEditing] = useState<ShareCollectionItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<ShareCollectionItem | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setItems(await api.listCollections());
    } catch (error) {
      showError(error);
      setItems([]);
    }
  }, [showError]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- tải danh sách từ API khi mở trang
    void load();
  }, [load]);

  const linkOf = (c: ShareCollectionItem) => `${SITE_URL}/${locale}/share/c/${c.token}`;

  const save = async (input: CollectionInput) => {
    try {
      if (editing) await api.updateCollection(editing.id, input);
      else await api.createCollection(input);
      toast.success(editing ? t("saved") : t("created"));
      setEditing(null);
      await load();
    } catch (error) {
      showError(error);
      throw error;
    }
  };

  const toInput = (c: ShareCollectionItem): CollectionInput => ({
    title: c.title,
    description: c.description,
    mode: c.mode,
    includePrivate: c.includePrivate,
    documentIds: c.documentIds,
    allowDownload: c.allowDownload,
    isActive: c.isActive,
    expiresAt: c.expiresAt,
  });

  const renew = async (c: ShareCollectionItem) => {
    try {
      await api.updateCollection(c.id, { ...toInput(c), renew: true });
      toast.success(t("renewed"));
      await load();
    } catch (error) {
      showError(error);
    }
  };

  const copy = async (c: ShareCollectionItem) => {
    try {
      await navigator.clipboard.writeText(linkOf(c));
      setCopied(c.id);
      toast.success(t("copied"));
      setTimeout(() => setCopied(null), 1600);
    } catch {
      toast.info(linkOf(c));
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <PageHeader
        title={t("title")}
        description={t("description")}
        actions={
          canCreate ? (
            <Button onClick={() => setCreating(true)}>
              <Plus /> {t("create")}
            </Button>
          ) : null
        }
      />

      {items === null ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-44 rounded-2xl" />
          <Skeleton className="h-44 rounded-2xl" />
        </div>
      ) : items.length === 0 ? (
        <div className="surface">
          <EmptyState
            icon="share"
            title={t("emptyTitle")}
            description={t("emptyHint")}
            action={canCreate ? <Button onClick={() => setCreating(true)}><Plus /> {t("create")}</Button> : undefined}
          />
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {items.map((c) => (
            <li key={c.id} className={cn("surface flex flex-col gap-4 p-5", !c.isActive && "opacity-60")}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate font-semibold">{c.title}</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {t(`mode.${c.mode}`)} · {t("docCount", { count: c.documentCount })}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm" aria-label={t("actions")} className="text-muted-foreground">
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuItem onSelect={() => setEditing(c)}>
                      <Pencil /> {t("edit")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => void renew(c)}>
                      <RefreshCw /> {t("renew")}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onSelect={() => setDeleting(c)}>
                      <Trash2 /> {t("delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {c.description ? <p className="line-clamp-2 text-sm text-muted-foreground">{c.description}</p> : null}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Eye className="size-3.5" /> {t("views", { count: c.views })}</span>
                {c.passwordProtected ? <span className="inline-flex items-center gap-1"><Lock className="size-3.5" /> {t("protected")}</span> : null}
                {c.expiresAt ? <span>{t("expires", { date: format.dateTime(new Date(c.expiresAt), { dateStyle: "medium" }) })}</span> : null}
                {!c.isActive ? <span className="font-medium text-destructive">{t("inactive")}</span> : null}
              </div>
              <div className="mt-auto flex gap-2">
                <Button variant="secondary" className="min-w-0 flex-1" onClick={() => void copy(c)}>
                  {copied === c.id ? <Check /> : <Copy />} <span className="truncate">{t("copyLink")}</span>
                </Button>
                <Button variant="ghost" size="icon" asChild aria-label={t("open")}>
                  <a href={`/${locale}/share/c/${c.token}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink />
                  </a>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {creating || editing ? (
        <CollectionDialog
          key={editing?.id ?? "new"}
          open
          initial={editing}
          onOpenChange={(v) => {
            if (!v) {
              setCreating(false);
              setEditing(null);
            }
          }}
          onSubmit={save}
        />
      ) : null}

      <AlertDialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("deleteDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: "destructive" })}
              onClick={async () => {
                if (!deleting) return;
                try {
                  await api.deleteCollection(deleting.id);
                  toast.success(t("deleted"));
                  await load();
                } catch (error) {
                  showError(error);
                }
              }}
            >
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
