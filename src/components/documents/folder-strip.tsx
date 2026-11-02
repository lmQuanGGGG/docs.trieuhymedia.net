"use client";

import { FolderPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { FolderIcon3D } from "@/components/icons3d";
import { useDialogs } from "@/lib/store/dialogs-store";
import { useWorkspace } from "@/lib/store/workspace-store";
import { cn } from "@/lib/utils";

export function FolderStrip({ value, onChange }: { value: string | null; onChange: (id: string | null) => void }) {
  const t = useTranslations();
  const { folders, documents, canCreate } = useWorkspace();
  const { open } = useDialogs();

  const active = value ? folders.find((f) => f.id === value) : null;
  // Đang ở thư mục gốc → hiện các thư mục gốc; đang ở thư mục → hiện thư mục con
  const visible = folders.filter((f) => f.parentId === (active?.parentId === null ? active.id : (active?.parentId ?? null)));
  const countIn = (id: string) => {
    const ids = new Set([id, ...folders.filter((f) => f.parentId === id).map((f) => f.id)]);
    return documents.filter((d) => d.folderId && ids.has(d.folderId)).length;
  };

  return (
    <section aria-label={t("documents.folders.title")} className="grid min-w-0 grid-cols-1 gap-3">
      <div className="flex items-center gap-1.5 text-sm">
        <button
          type="button"
          onClick={() => onChange(null)}
          className={cn("font-medium text-muted-foreground hover:text-foreground", !value && "text-foreground")}
        >
          {t("documents.folders.root")}
        </button>
        {active ? (
          <>
            {active.parentId ? (
              <>
                <span className="text-muted-foreground/60">/</span>
                <button type="button" onClick={() => onChange(active.parentId)} className="font-medium text-muted-foreground hover:text-foreground">
                  {folders.find((f) => f.id === active.parentId)?.name}
                </button>
              </>
            ) : null}
            <span className="text-muted-foreground/60">/</span>
            <span className="truncate font-medium">{active.name}</span>
          </>
        ) : null}
      </div>
      <div className="-mx-4 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 scrollbar-none sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3 xl:grid-cols-5">
        {visible.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => onChange(f.id)}
            aria-pressed={value === f.id}
            className={cn(
              "surface surface-interactive flex w-56 shrink-0 snap-start items-center gap-3 p-3 text-left sm:w-auto",
              value === f.id && "ring-2 ring-brand/50",
            )}
          >
            <FolderIcon3D color={f.color} size={36} />
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">{f.name}</span>
              <span className="block text-xs text-muted-foreground">{t("documents.folders.items", { count: countIn(f.id) })}</span>
            </span>
          </button>
        ))}
        <button
          type="button"
          hidden={!canCreate}
          onClick={() => open({ kind: "folder" })}
          className="flex w-48 shrink-0 snap-start items-center gap-3 rounded-2xl bg-muted/50 p-3 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:w-auto"
        >
          <span className="grid size-9 place-items-center rounded-[11px] bg-card shadow-soft">
            <FolderPlus className="size-4" />
          </span>
          {t("dialogs.folder.title")}
        </button>
      </div>
    </section>
  );
}
