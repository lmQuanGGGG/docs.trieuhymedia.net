"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { type CSSProperties, type PointerEvent, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { FileTypeIcon } from "@/components/documents/file-type-icon";
import { IconTile } from "@/components/shared/icon-tile";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { DocumentItem } from "@/types";

const SWIPE_PX = 40;

/**
 * Chồng card xếp lớp: card trước nghiêng nhẹ, card sau lộ ra phía sau.
 * Vuốt ngang (mobile) hoặc bấm mũi tên để chuyển, có chuyển cảnh 3D.
 */
export function FeaturedStack({ documents }: { documents: DocumentItem[] }) {
  const t = useTranslations();
  const format = useFormatter();
  const [index, setIndex] = useState(0);
  const startX = useRef<number | null>(null);
  const count = documents.length;
  if (count === 0) return null;

  // Chỉ 1 tài liệu: một card duy nhất, không lớp phía sau, không điều hướng
  const single = count === 1;
  // Giữ chỉ số hợp lệ khi danh sách thay đổi (vd. bỏ gắn sao)
  const active = index % count;
  const go = (dir: 1 | -1) => setIndex((i) => (i + dir + count) % count);

  const onPointerDown = (e: PointerEvent) => {
    startX.current = e.clientX;
  };
  const onPointerUp = (e: PointerEvent) => {
    if (startX.current === null) return;
    const dx = e.clientX - startX.current;
    startX.current = null;
    if (Math.abs(dx) > SWIPE_PX) go(dx < 0 ? 1 : -1);
  };

  return (
    <div className="flex flex-col gap-3">
      <div
        className="relative h-[228px] touch-pan-y select-none [perspective:1100px] sm:h-[244px]"
        onPointerDown={single ? undefined : onPointerDown}
        onPointerUp={single ? undefined : onPointerUp}
        onPointerCancel={single ? undefined : () => (startX.current = null)}
        aria-roledescription={single ? undefined : "carousel"}
      >
        {documents.map((d, i) => {
          const pos = (i - active + count) % count; // 0 = trước nhất
          const hidden = pos > 2;
          return (
            <Link
              key={d.id}
              href={`/documents/${d.id}`}
              draggable={false}
              tabIndex={pos === 0 ? 0 : -1}
              aria-hidden={pos !== 0}
              style={
                {
                  zIndex: 10 - pos,
                  transform: `translate3d(${pos * 16}px, ${pos * -12}px, ${pos * -60}px) rotateY(${pos === 0 ? 0 : -8}deg)`,
                  opacity: hidden ? 0 : 1 - pos * 0.25,
                } as CSSProperties
              }
              className={cn(
                "absolute inset-y-2 left-0 origin-left overflow-hidden rounded-[20px] bg-card p-5 shadow-lift transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
                single ? "w-full" : "w-[86%] sm:w-[82%]",
                pos > 0 && "shadow-soft",
                hidden && "pointer-events-none",
              )}
            >
              <div className="flex h-full flex-col">
                <div className="flex items-center gap-2.5">
                  <IconTile name={d.category} size="sm" />
                  <span className="truncate text-xs font-medium text-muted-foreground">
                    {t(`categories.${d.category}.name`)} · {d.brand}
                  </span>
                </div>
                <span className="mt-4 line-clamp-3 text-lg leading-snug font-semibold text-balance">{d.title}</span>
                <span className="mt-auto flex items-center gap-2 text-xs text-muted-foreground">
                  <FileTypeIcon type={d.type} size="sm" />
                  {format.dateTime(new Date(d.updatedAt), { dateStyle: "medium" })}
                  {d.pages ? ` · ${t("common.pagesCount", { count: d.pages })}` : ""}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
      {single ? null : (
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5" aria-hidden>
            {documents.map((d, i) => (
              <span key={d.id} className={cn("h-1.5 rounded-full bg-foreground/15 transition-all", i === active ? "w-5 bg-brand" : "w-1.5")} />
            ))}
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon-sm" onClick={() => go(-1)} aria-label={t("common.previous")}>
              <ChevronLeft />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => go(1)} aria-label={t("common.next")}>
              <ChevronRight />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
