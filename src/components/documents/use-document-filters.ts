"use client";

import { useEffect, useMemo, useState } from "react";
import type { CategorySlug, DocumentItem, DocumentStatus, DocumentType } from "@/types";

export type SortKey = "updated" | "name" | "status";
export type ViewMode = "list" | "grid";

export interface DocumentFilters {
  query: string;
  category: CategorySlug | "all";
  type: DocumentType | "all";
  status: DocumentStatus | "all";
  sort: SortKey;
  folderId: string | null;
}

const statusOrder: Record<DocumentStatus, number> = { review: 0, draft: 1, approved: 2, archived: 3 };
const VIEW_KEY = "thm-documents-view";

export const defaultFilters: DocumentFilters = {
  query: "",
  category: "all",
  type: "all",
  status: "all",
  sort: "updated",
  folderId: null,
};

export function isFiltered(f: DocumentFilters, lockedCategory?: boolean): boolean {
  return (
    f.query.trim() !== "" ||
    (!lockedCategory && f.category !== "all") ||
    f.type !== "all" ||
    f.status !== "all" ||
    f.folderId !== null
  );
}

/** Lọc + sắp xếp; folderId khớp cả thư mục con */
export function applyFilters(
  docs: DocumentItem[],
  f: DocumentFilters,
  folderChildren: (id: string) => string[],
  locale: string,
): DocumentItem[] {
  const q = f.query.trim().toLocaleLowerCase(locale);
  const folderIds = f.folderId ? new Set([f.folderId, ...folderChildren(f.folderId)]) : null;
  const collator = new Intl.Collator(locale, { sensitivity: "base", numeric: true });

  return docs
    .filter((d) => (q ? d.title.toLocaleLowerCase(locale).includes(q) : true))
    .filter((d) => (f.category === "all" ? true : d.category === f.category))
    .filter((d) => (f.type === "all" ? true : d.type === f.type))
    .filter((d) => (f.status === "all" ? true : d.status === f.status))
    .filter((d) => (folderIds ? d.folderId !== null && folderIds.has(d.folderId) : true))
    .sort((a, b) => {
      if (f.sort === "name") return collator.compare(a.title, b.title);
      if (f.sort === "status") return statusOrder[a.status] - statusOrder[b.status] || b.updatedAt.localeCompare(a.updatedAt);
      return b.updatedAt.localeCompare(a.updatedAt);
    });
}

export function useViewMode(): [ViewMode, (mode: ViewMode) => void] {
  const [view, setView] = useState<ViewMode>("list");
  useEffect(() => {
    try {
      const saved = localStorage.getItem(VIEW_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- đọc tuỳ chọn đã lưu sau khi hydrate
      if (saved === "grid" || saved === "list") setView(saved);
    } catch {
      // bỏ qua
    }
  }, []);
  const update = (mode: ViewMode) => {
    setView(mode);
    try {
      localStorage.setItem(VIEW_KEY, mode);
    } catch {
      // bỏ qua
    }
  };
  return [view, update];
}

export function useFilterState(initial?: Partial<DocumentFilters>) {
  const [filters, setFilters] = useState<DocumentFilters>({ ...defaultFilters, ...initial });
  const update = useMemo(
    () =>
      <K extends keyof DocumentFilters>(key: K, value: DocumentFilters[K]) =>
        setFilters((prev) => ({ ...prev, [key]: value })),
    [],
  );
  const reset = () => setFilters({ ...defaultFilters, ...initial });
  return { filters, update, reset };
}
