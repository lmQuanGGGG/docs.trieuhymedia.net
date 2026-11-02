"use client";

import { Star } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import type { CSSProperties } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { MemberAvatar } from "@/components/shared/member-avatar";
import { categoryMap } from "@/config/categories";
import { Link } from "@/i18n/navigation";
import { useWorkspace } from "@/lib/store/workspace-store";
import { cn } from "@/lib/utils";
import type { DocumentItem } from "@/types";
import { StatusBadge } from "./badges";
import { DocumentActionsMenu, DocumentContextMenu } from "./document-menu";
import { fileTypeMeta } from "./file-type-icon";
import { useDocumentActions } from "./use-document-actions";

/** Card tài liệu không viền, bóng mềm, thumbnail có glow theo màu danh mục */
export function DocumentCard({
  document: d,
  selected,
  onSelectedChange,
}: {
  document: DocumentItem;
  selected?: boolean;
  onSelectedChange?: (value: boolean) => void;
}) {
  const t = useTranslations();
  const format = useFormatter();
  const { getMember } = useWorkspace();
  const actions = useDocumentActions();
  const color = categoryMap[d.category].color;
  const ft = fileTypeMeta[d.type];
  const Icon = ft.icon;

  return (
    <DocumentContextMenu document={d}>
      <article
        style={{ "--c": color } as CSSProperties}
        className={cn(
          "group surface surface-interactive relative flex flex-col overflow-hidden",
          selected && "ring-2 ring-brand/50",
        )}
      >
        <div className="relative m-2 mb-0 grid aspect-[16/10] place-items-center overflow-hidden rounded-xl bg-[color-mix(in_oklab,var(--c),transparent_92%)] dark:bg-[color-mix(in_oklab,var(--c),transparent_86%)]">
          {/* Trang giấy xếp lớp */}
          <span className="absolute h-[62%] w-[38%] translate-x-2 -translate-y-1 rotate-6 rounded-md bg-card/70 shadow-soft" />
          <span className="relative grid h-[66%] w-[40%] place-items-center rounded-md bg-card shadow-soft transition-transform duration-300 group-hover:-translate-y-1">
            <Icon className="size-7" style={{ color: ft.color }} strokeWidth={1.6} />
            <span className="absolute bottom-1.5 text-[9px] font-semibold tracking-wider text-muted-foreground">{ft.label}</span>
          </span>
          {onSelectedChange ? (
            <span
              className={cn(
                "absolute top-2.5 left-2.5 z-10 grid size-6 place-items-center rounded-md bg-card/90 shadow-soft transition-opacity",
                selected ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus-within:opacity-100 max-md:opacity-100",
              )}
            >
              <Checkbox
                checked={selected}
                onCheckedChange={(v) => onSelectedChange(v === true)}
                aria-label={`${t("documents.bulk.selectRow")}: ${d.title}`}
              />
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => void actions.toggleStar(d)}
            aria-label={d.starred ? t("documents.actions.unstar") : t("documents.actions.star")}
            aria-pressed={d.starred}
            className={cn(
              "absolute top-2.5 right-2.5 z-10 grid size-7 place-items-center rounded-md bg-card/90 shadow-soft transition-opacity",
              d.starred ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100 max-md:opacity-100",
            )}
          >
            <Star className={cn("size-3.5", d.starred ? "fill-warning text-warning" : "text-muted-foreground")} />
          </button>
        </div>
        <div className="flex flex-1 flex-col gap-2 p-3.5 pt-3">
          <Link
            href={`/documents/${d.id}`}
            className="line-clamp-2 text-sm leading-snug font-medium text-pretty after:absolute after:inset-0 after:content-['']"
          >
            {d.title}
          </Link>
          <div className="text-xs text-muted-foreground">
            {t(`categories.${d.category}.name`)} · {format.dateTime(new Date(d.updatedAt), { dateStyle: "medium" })}
          </div>
          <div className="relative z-10 mt-auto flex items-center justify-between gap-2 pt-1">
            <span className="flex min-w-0 items-center gap-2">
              <MemberAvatar member={getMember(d.ownerId)} size="xs" />
              <StatusBadge status={d.status} className="h-5 px-2 text-[11px]" />
            </span>
            <DocumentActionsMenu document={d} className="-mr-1.5" />
          </div>
        </div>
      </article>
    </DocumentContextMenu>
  );
}
