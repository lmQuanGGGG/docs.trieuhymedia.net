"use client";

import type { RowSelectionState } from "@tanstack/react-table";
import { FilePlus2, Upload } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { type ReactNode, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { useDialogs } from "@/lib/store/dialogs-store";
import { useWorkspace } from "@/lib/store/workspace-store";
import type { CategorySlug, DocumentItem } from "@/types";
import { BulkBar } from "./bulk-bar";
import { DocumentCard } from "./document-card";
import { GridSkeleton, TableSkeleton } from "./document-skeletons";
import { DocumentTable } from "./document-table";
import { DocumentToolbar } from "./document-toolbar";
import { FolderStrip } from "./folder-strip";
import { applyFilters, isFiltered, useFilterState, useViewMode } from "./use-document-filters";

export interface DocumentsViewProps {
  title: string;
  description: string;
  leading?: ReactNode;
  /** Bộ lọc cố định của trang (danh mục, đã gắn sao, …) */
  scope?: (doc: DocumentItem) => boolean;
  category?: CategorySlug;
  showFolders?: boolean;
  emptyKind?: "default" | "starred";
}

export function DocumentsView({ title, description, leading, scope, category, showFolders, emptyKind = "default" }: DocumentsViewProps) {
  const t = useTranslations();
  const locale = useLocale();
  const { documents, folders, status, canCreate } = useWorkspace();
  const { open } = useDialogs();
  const { filters, update, reset } = useFilterState(category ? { category } : undefined);
  const [view, setView] = useViewMode();
  const [selection, setSelection] = useState<RowSelectionState>({});

  const scoped = useMemo(() => (scope ? documents.filter(scope) : documents), [documents, scope]);
  const visible = useMemo(
    () =>
      applyFilters(
        scoped,
        filters,
        (id) => folders.filter((f) => f.parentId === id).map((f) => f.id),
        locale,
      ),
    [scoped, filters, folders, locale],
  );

  // Bỏ id đã bị xoá/không còn hiển thị khỏi lựa chọn
  const selectedIds = Object.keys(selection).filter((id) => selection[id] && visible.some((d) => d.id === id));
  const filtered = isFiltered(filters, !!category);

  const actions = canCreate ? (
    <>
      <Button variant="secondary" onClick={() => open({ kind: "upload" })}>
        <Upload /> {t("common.upload")}
      </Button>
      <Button onClick={() => open({ kind: "newDocument" })}>
        <FilePlus2 /> {t("overview.actions.newDocument")}
      </Button>
    </>
  ) : null;

  let body: ReactNode;
  if (status === "loading") {
    body = view === "grid" ? <GridSkeleton /> : <div className="surface"><TableSkeleton /></div>;
  } else if (visible.length === 0) {
    body = (
      <div className="surface">
        {filtered ? (
          <EmptyState
            icon="search-empty"
            title={t("documents.empty.filteredTitle")}
            description={t("documents.empty.filteredDescription")}
            action={<Button variant="secondary" onClick={reset}>{t("documents.toolbar.resetFilters")}</Button>}
          />
        ) : emptyKind === "starred" ? (
          <EmptyState icon="star" title={t("documents.empty.starredTitle")} description={t("documents.empty.starredDescription")} />
        ) : (
          <EmptyState
            icon="folder"
            title={t("documents.empty.title")}
            description={t("documents.empty.description")}
            action={canCreate ? <Button onClick={() => open({ kind: "upload" })}><Upload /> {t("common.upload")}</Button> : undefined}
          />
        )}
      </div>
    );
  } else if (view === "grid") {
    body = (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
        {visible.map((d) => (
          <DocumentCard
            key={d.id}
            document={d}
            selected={!!selection[d.id]}
            onSelectedChange={(v) => setSelection((s) => ({ ...s, [d.id]: v }))}
          />
        ))}
      </div>
    );
  } else {
    body = (
      <div className="surface overflow-hidden">
        <DocumentTable documents={visible} rowSelection={selection} onRowSelectionChange={setSelection} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      <PageHeader title={title} description={description} leading={leading} actions={actions} />
      {showFolders ? <FolderStrip value={filters.folderId} onChange={(id) => update("folderId", id)} /> : null}
      <DocumentToolbar
        filters={filters}
        onChange={update}
        onReset={reset}
        filtered={filtered}
        view={view}
        onViewChange={setView}
        lockCategory={!!category}
      />
      {status === "ready" ? (
        <p className="-mt-3 text-xs text-muted-foreground" aria-live="polite">
          {t("common.documentsCount", { count: visible.length })}
        </p>
      ) : null}
      {body}
      <BulkBar ids={selectedIds} onClear={() => setSelection({})} />
    </div>
  );
}
