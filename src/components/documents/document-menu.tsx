"use client";

import { Download, ExternalLink, Link2, MoreHorizontal, Pencil, Share2, Star, StarOff, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Fragment, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { DocumentItem } from "@/types";
import { useDocumentActions } from "./use-document-actions";

interface MenuEntry {
  key: string;
  label: string;
  icon: typeof Star;
  onSelect: () => void;
  destructive?: boolean;
  separatorBefore?: boolean;
}

function useMenuEntries(doc: DocumentItem): MenuEntry[] {
  const t = useTranslations("documents.actions");
  const router = useRouter();
  const actions = useDocumentActions();
  const can = doc.can ?? { edit: false, delete: false, share: false };
  const entries: Array<MenuEntry | false> = [
    { key: "open", label: t("open"), icon: ExternalLink, onSelect: () => router.push(`/documents/${doc.id}`) },
    {
      key: "star",
      label: doc.starred ? t("unstar") : t("star"),
      icon: doc.starred ? StarOff : Star,
      onSelect: () => void actions.toggleStar(doc),
    },
    can.edit && { key: "rename", label: t("rename"), icon: Pencil, onSelect: () => actions.rename(doc), separatorBefore: true },
    can.share && { key: "share", label: t("share"), icon: Share2, onSelect: () => actions.share(doc) },
    { key: "download", label: t("download"), icon: Download, onSelect: () => actions.download(doc) },
    { key: "copy", label: t("copyLink"), icon: Link2, onSelect: () => void actions.copyLink(doc) },
    can.delete && { key: "delete", label: t("delete"), icon: Trash2, onSelect: () => actions.remove(doc), destructive: true, separatorBefore: true },
  ];
  return entries.filter((e): e is MenuEntry => e !== false);
}

export function DocumentActionsMenu({ document, className }: { document: DocumentItem; className?: string }) {
  const t = useTranslations("common");
  const entries = useMenuEntries(document);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`${t("more")}: ${document.title}`}
          className={cn("text-muted-foreground", className)}
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52" onClick={(e) => e.stopPropagation()}>
        {entries.map((e) => (
          <Fragment key={e.key}>
            {e.separatorBefore ? <DropdownMenuSeparator /> : null}
            <DropdownMenuItem onSelect={e.onSelect} variant={e.destructive ? "destructive" : "default"}>
              <e.icon /> {e.label}
            </DropdownMenuItem>
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function DocumentContextMenu({ document, children }: { document: DocumentItem; children: ReactNode }) {
  const entries = useMenuEntries(document);
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-52">
        {entries.map((e) => (
          <Fragment key={e.key}>
            {e.separatorBefore ? <ContextMenuSeparator /> : null}
            <ContextMenuItem onSelect={e.onSelect} variant={e.destructive ? "destructive" : "default"}>
              <e.icon /> {e.label}
            </ContextMenuItem>
          </Fragment>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  );
}
