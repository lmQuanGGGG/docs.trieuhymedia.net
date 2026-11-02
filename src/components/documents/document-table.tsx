"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  type RowSelectionState,
  useReactTable,
} from "@tanstack/react-table";
import { Star } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { MemberAvatar } from "@/components/shared/member-avatar";
import { useRouter } from "@/i18n/navigation";
import { useWorkspace } from "@/lib/store/workspace-store";
import { cn } from "@/lib/utils";
import type { DocumentItem } from "@/types";
import { StatusBadge, VisibilityLabel } from "./badges";
import { DocumentActionsMenu, DocumentContextMenu } from "./document-menu";
import { FileTypeIcon } from "./file-type-icon";

type Column = ColumnDef<DocumentItem> & { meta?: { className?: string } };

export function DocumentTable({
  documents,
  rowSelection,
  onRowSelectionChange,
  selectable = true,
  compact = false,
}: {
  documents: DocumentItem[];
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: (next: RowSelectionState) => void;
  selectable?: boolean;
  /** Bỏ bớt cột cho bảng trên trang Tổng quan */
  compact?: boolean;
}) {
  const t = useTranslations();
  const format = useFormatter();
  const router = useRouter();
  const { getMember } = useWorkspace();

  const columns = useMemo<Column[]>(() => {
    const cols: Column[] = [];
    if (selectable) {
      cols.push({
        id: "select",
        header: ({ table }) => (
          <Checkbox
            aria-label={t("documents.bulk.selectAll")}
            checked={table.getIsAllRowsSelected() ? true : table.getIsSomeRowsSelected() ? "indeterminate" : false}
            onCheckedChange={(v) => table.toggleAllRowsSelected(v === true)}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            aria-label={`${t("documents.bulk.selectRow")}: ${row.original.title}`}
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(v === true)}
            onClick={(e) => e.stopPropagation()}
          />
        ),
        meta: { className: "w-10 pl-4" },
      });
    }
    cols.push(
      {
        id: "name",
        header: t("documents.columns.name"),
        cell: ({ row }) => {
          const d = row.original;
          return (
            <div className="flex min-w-0 items-center gap-3">
              <FileTypeIcon type={d.type} />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="truncate font-medium text-foreground">{d.title}</span>
                  {d.starred ? <Star className="size-3.5 shrink-0 fill-warning text-warning" aria-label={t("nav.starred")} /> : null}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {d.brand}
                  <span className="lg:hidden"> · {format.dateTime(new Date(d.updatedAt), { dateStyle: "medium" })}</span>
                </div>
              </div>
            </div>
          );
        },
        meta: { className: cn("min-w-0", selectable ? "" : "pl-4") },
      },
      {
        id: "type",
        header: t("documents.columns.type"),
        cell: ({ row }) => <span className="text-muted-foreground">{t(`documentTypes.${row.original.type}`)}</span>,
        meta: { className: "hidden w-28 2xl:table-cell" },
      },
      {
        id: "category",
        header: t("documents.columns.category"),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-muted-foreground">{t(`categories.${row.original.category}.name`)}</span>
        ),
        meta: { className: cn("hidden w-40", compact ? "md:table-cell" : "xl:table-cell") },
      },
      {
        id: "updated",
        header: t("documents.columns.updated"),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-muted-foreground">
            {format.dateTime(new Date(row.original.updatedAt), { dateStyle: "medium" })}
          </span>
        ),
        meta: { className: "hidden w-32 lg:table-cell" },
      },
      {
        id: "owner",
        header: t("documents.columns.owner"),
        cell: ({ row }) => {
          const owner = getMember(row.original.ownerId);
          return (
            <span className="flex items-center gap-2 whitespace-nowrap">
              <MemberAvatar member={owner} size="xs" />
              <span className="hidden truncate text-muted-foreground 2xl:inline">{owner?.name}</span>
            </span>
          );
        },
        meta: { className: "hidden w-24 lg:table-cell 2xl:w-44" },
      },
      {
        id: "visibility",
        header: t("documents.columns.visibility"),
        cell: ({ row }) => <VisibilityLabel visibility={row.original.visibility} />,
        meta: { className: "hidden w-28 md:table-cell" },
      },
    );
    if (!compact) {
      cols.push({
        id: "status",
        header: t("documents.columns.status"),
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
        meta: { className: "hidden w-28 sm:table-cell" },
      });
    }
    cols.push({
      id: "actions",
      header: () => <span className="sr-only">{t("documents.columns.actions")}</span>,
      cell: ({ row }) => <DocumentActionsMenu document={row.original} />,
      meta: { className: "w-12 pr-3 text-right" },
    });
    return cols;
  }, [t, format, getMember, selectable, compact]);

  // TanStack Table trả về hàm không memo được; đây là cách dùng chuẩn của thư viện
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: documents,
    columns,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    state: { rowSelection: rowSelection ?? {} },
    enableRowSelection: selectable,
    onRowSelectionChange: (updater) => {
      if (!onRowSelectionChange) return;
      onRowSelectionChange(typeof updater === "function" ? updater(rowSelection ?? {}) : updater);
    },
  });

  return (
    <table className="w-full table-fixed text-sm">
      <thead>
        {table.getHeaderGroups().map((hg) => (
          <tr key={hg.id} className="text-left">
            {hg.headers.map((h) => (
              <th
                key={h.id}
                scope="col"
                className={cn(
                  "h-10 truncate px-3 text-xs font-medium whitespace-nowrap text-muted-foreground",
                  (h.column.columnDef as Column).meta?.className,
                )}
              >
                {flexRender(h.column.columnDef.header, h.getContext())}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <DocumentContextMenu key={row.id} document={row.original}>
            <tr
              onClick={() => router.push(`/documents/${row.original.id}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.target === e.currentTarget) router.push(`/documents/${row.original.id}`);
              }}
              tabIndex={0}
              data-state={row.getIsSelected() ? "selected" : undefined}
              className={cn(
                "group cursor-pointer shadow-[inset_0_1px_0_var(--border)] transition-colors outline-none",
                "hover:bg-muted/50 focus-visible:bg-muted/60 data-[state=selected]:bg-brand-soft/70",
              )}
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className={cn("h-14 px-3 align-middle", (cell.column.columnDef as Column).meta?.className)}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          </DocumentContextMenu>
        ))}
      </tbody>
    </table>
  );
}
