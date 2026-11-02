"use client";

import { LayoutGrid, List, Search, SlidersHorizontal, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { categorySlugs, documentStatuses, documentTypes } from "@/types";
import type { DocumentFilters, SortKey, ViewMode } from "./use-document-filters";

export function DocumentToolbar({
  filters,
  onChange,
  onReset,
  filtered,
  view,
  onViewChange,
  lockCategory,
}: {
  filters: DocumentFilters;
  onChange: <K extends keyof DocumentFilters>(key: K, value: DocumentFilters[K]) => void;
  onReset: () => void;
  filtered: boolean;
  view: ViewMode;
  onViewChange: (mode: ViewMode) => void;
  lockCategory?: boolean;
}) {
  const t = useTranslations();

  return (
    <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
      <div className="relative min-w-0 flex-1 lg:max-w-xs">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={filters.query}
          onChange={(e) => onChange("query", e.target.value)}
          placeholder={t("documents.toolbar.search")}
          aria-label={t("documents.toolbar.search")}
          className="h-9 rounded-xl border-transparent bg-card pl-9 shadow-soft"
        />
      </div>

      <div className="flex min-w-0 items-center gap-2 overflow-x-auto scrollbar-none lg:flex-1">
        <SlidersHorizontal className="hidden size-4 shrink-0 text-muted-foreground lg:block" aria-hidden />
        {!lockCategory ? (
          <Select value={filters.category} onValueChange={(v) => onChange("category", v as DocumentFilters["category"])}>
            <SelectTrigger size="sm" className="h-8 shrink-0 rounded-lg border-transparent bg-card shadow-soft" aria-label={t("documents.toolbar.category")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("documents.toolbar.allCategories")}</SelectItem>
              {categorySlugs.map((c) => (
                <SelectItem key={c} value={c}>{t(`categories.${c}.name`)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
        <Select value={filters.type} onValueChange={(v) => onChange("type", v as DocumentFilters["type"])}>
          <SelectTrigger size="sm" className="h-8 shrink-0 rounded-lg border-transparent bg-card shadow-soft" aria-label={t("documents.toolbar.type")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("documents.toolbar.allTypes")}</SelectItem>
            {documentTypes.map((c) => (
              <SelectItem key={c} value={c}>{t(`documentTypes.${c}`)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filters.status} onValueChange={(v) => onChange("status", v as DocumentFilters["status"])}>
          <SelectTrigger size="sm" className="h-8 shrink-0 rounded-lg border-transparent bg-card shadow-soft" aria-label={t("documents.toolbar.status")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("documents.toolbar.allStatuses")}</SelectItem>
            {documentStatuses.map((c) => (
              <SelectItem key={c} value={c}>{t(`statuses.${c}`)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {filtered ? (
          <Button variant="ghost" size="sm" onClick={onReset} className="shrink-0 text-muted-foreground">
            <X /> {t("documents.toolbar.resetFilters")}
          </Button>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-2 lg:justify-end">
        <Select value={filters.sort} onValueChange={(v) => onChange("sort", v as SortKey)}>
          <SelectTrigger size="sm" className="h-8 rounded-lg border-transparent bg-card shadow-soft" aria-label={t("documents.toolbar.sort")}>
            <span className="text-muted-foreground">{t("documents.toolbar.sort")}:</span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="updated">{t("documents.toolbar.sortUpdated")}</SelectItem>
            <SelectItem value="name">{t("documents.toolbar.sortName")}</SelectItem>
            <SelectItem value="status">{t("documents.toolbar.sortStatus")}</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex rounded-lg bg-muted p-0.5" role="group">
          {(["list", "grid"] as const).map((mode) => {
            const Icon = mode === "list" ? List : LayoutGrid;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => onViewChange(mode)}
                aria-pressed={view === mode}
                aria-label={mode === "list" ? t("documents.toolbar.listView") : t("documents.toolbar.gridView")}
                className={cn(
                  "grid size-7 place-items-center rounded-md text-muted-foreground transition-all",
                  view === mode && "bg-card text-foreground shadow-soft",
                )}
              >
                <Icon className="size-4" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
