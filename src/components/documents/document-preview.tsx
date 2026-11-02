"use client";

import { Download, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CSSProperties } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DocumentItem } from "@/types";
import { fileTypeMeta } from "./file-type-icon";

/**
 * Chỉ nhúng PDF khi có previewUrl hợp lệ. Định dạng khác hiển thị trạng thái
 * "chưa hỗ trợ xem trước" + nút tải — không giả lập render nội dung.
 */
export function DocumentPreview({
  document: d,
  onDownload,
  className,
}: {
  document: DocumentItem;
  /** Bỏ trống để ẩn nút tải (vd. liên kết công khai tắt quyền tải) */
  onDownload?: () => void;
  className?: string;
}) {
  const t = useTranslations();
  const ft = fileTypeMeta[d.type];
  const Icon = ft.icon;

  if (d.type === "pdf" && d.previewUrl) {
    return (
      <div className={cn("overflow-hidden rounded-2xl bg-muted", className)}>
        <object data={`${d.previewUrl}#view=FitH`} type="application/pdf" className="block h-[68vh] min-h-[420px] w-full" aria-label={d.title}>
          <div className="grid h-full place-items-center p-8 text-center text-sm text-muted-foreground">
            <div className="grid gap-3">
              <p>{t("detail.pdfFallback")}</p>
              <Button asChild variant="secondary">
                <a href={d.previewUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink /> {t("detail.openInNewTab")}
                </a>
              </Button>
            </div>
          </div>
        </object>
      </div>
    );
  }

  const isLink = d.type === "link";
  return (
    <div
      style={{ "--ft": ft.color } as CSSProperties}
      className={cn(
        "relative grid min-h-[360px] place-items-center overflow-hidden rounded-2xl p-8 text-center sm:min-h-[460px]",
        "bg-[color-mix(in_oklab,var(--ft),transparent_94%)]",
        className,
      )}
    >
      <div className="relative grid justify-items-center gap-4">
        <span className="relative grid h-40 w-32 place-items-center rounded-xl bg-card shadow-lift">
          <span aria-hidden className="absolute -z-10 h-36 w-28 translate-x-4 -translate-y-2 rotate-6 rounded-xl bg-card/70 shadow-soft" />
          <Icon className="size-12" style={{ color: ft.color }} strokeWidth={1.4} />
          <span className="absolute bottom-3 text-[10px] font-semibold tracking-wider text-muted-foreground">{ft.label}</span>
        </span>
        <div className="max-w-sm">
          <p className="text-sm font-medium">
            {isLink ? t("detail.externalHint") : t("detail.noPreview", { type: t(`documentTypes.${d.type}`) })}
          </p>
          {!isLink && onDownload ? <p className="mt-1 text-sm text-muted-foreground">{t("detail.noPreviewHint")}</p> : null}
        </div>
        {isLink && d.externalUrl ? (
          <Button asChild>
            <a href={d.externalUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink /> {t("detail.openExternal")}
            </a>
          </Button>
        ) : onDownload ? (
          <Button onClick={onDownload}>
            <Download /> {t("common.download")}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
