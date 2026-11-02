"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ReaderError } from "./reader-states";

const MAX_ROWS = 500;

interface Sheet {
  name: string;
  rows: Array<Array<string | number | boolean | null>>;
}

/** Đọc bảng tính bằng SheetJS và hiển thị bằng bảng của giao diện (không chèn HTML thô) */
export function XlsxReader({ url }: { url: string }) {
  const t = useTranslations("reader");
  const [sheets, setSheets] = useState<Sheet[] | null>(null);
  const [active, setActive] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [XLSX, res] = await Promise.all([import("xlsx"), fetch(url)]);
        if (!res.ok) throw new Error(String(res.status));
        const wb = XLSX.read(await res.arrayBuffer());
        const list = wb.SheetNames.map((name) => ({
          name,
          rows: XLSX.utils.sheet_to_json<Array<string | number | boolean | null>>(wb.Sheets[name], {
            header: 1,
            defval: null,
            raw: false,
          }),
        }));
        if (!cancelled) setSheets(list);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (failed) return <ReaderError url={url} />;
  if (!sheets) return <Skeleton className="h-[420px] w-full rounded-xl" aria-label={t("loading")} />;

  const sheet = sheets[active];
  const [head = [], ...body] = sheet?.rows ?? [];
  const shown = body.slice(0, MAX_ROWS);
  const cols = Math.max(head.length, ...shown.map((r) => r.length));

  return (
    <div className="grid gap-3">
      {sheets.length > 1 ? (
        <div className="flex gap-1 overflow-x-auto scrollbar-none" role="tablist" aria-label={t("sheet")}>
          {sheets.map((s, i) => (
            <button
              key={s.name}
              type="button"
              role="tab"
              aria-selected={i === active}
              onClick={() => setActive(i)}
              className={cn(
                "shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted",
                i === active && "bg-card text-foreground shadow-soft",
              )}
            >
              {s.name}
            </button>
          ))}
        </div>
      ) : null}
      <div className="max-h-[75vh] overflow-auto rounded-xl bg-card shadow-soft">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 z-10 bg-muted">
            <tr>
              <th className="w-10 px-3 py-2 text-right text-xs font-medium text-muted-foreground">#</th>
              {Array.from({ length: cols }, (_, c) => (
                <th key={c} className="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap">
                  {head[c] ?? ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((row, r) => (
              <tr key={r} className="shadow-[inset_0_1px_0_var(--border)] hover:bg-muted/40">
                <td className="px-3 py-2 text-right text-xs text-muted-foreground tabular-nums">{r + 2}</td>
                {Array.from({ length: cols }, (_, c) => {
                  const v = row[c];
                  return (
                    <td key={c} className={cn("px-3 py-2 whitespace-nowrap", typeof v === "number" && "text-right tabular-nums")}>
                      {v === null || v === undefined ? "" : String(v)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {body.length > MAX_ROWS ? <p className="text-xs text-muted-foreground">{t("rowsTruncated", { count: MAX_ROWS })}</p> : null}
    </div>
  );
}
