"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { DocumentPreview } from "@/components/documents/document-preview";
import { cn } from "@/lib/utils";
import type { DocumentItem } from "@/types";

// Thư viện đọc tài liệu khá nặng: chỉ tải khi cần
const loading = () => <Skeleton className="aspect-[1/1.2] w-full max-w-[880px] rounded-md" />;
const PdfReader = dynamic(() => import("./pdf-reader").then((m) => m.PdfReader), { ssr: false, loading });
const DocxReader = dynamic(() => import("./docx-reader").then((m) => m.DocxReader), { ssr: false, loading });
const XlsxReader = dynamic(() => import("./xlsx-reader").then((m) => m.XlsxReader), { ssr: false, loading });

function VideoReader({ url, title }: { url: string; title: string }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-black shadow-soft">
      {/* preload=metadata: chỉ tải phần đầu, tua bằng Range request */}
      <video src={url} controls playsInline preload="metadata" className="mx-auto block max-h-[78vh] w-full" aria-label={title} />
    </div>
  );
}

function ImageReader({ url, title }: { url: string; title: string }) {
  const [full, setFull] = useState(false);
  return (
    <button type="button" onClick={() => setFull((v) => !v)} className={cn("mx-auto block cursor-zoom-in", full && "cursor-zoom-out")}>
      {/* eslint-disable-next-line @next/next/no-img-element -- ảnh người dùng tải lên, kích thước không biết trước */}
      <img src={url} alt={title} className={cn("mx-auto rounded-xl shadow-soft", full ? "w-full" : "max-h-[75vh] w-auto")} />
    </button>
  );
}

/**
 * Chọn trình đọc phù hợp để xem tài liệu ngay trên trang.
 * PPTX được xem qua bản PDF mà máy chủ chuyển đổi (previewUrl); chưa có thì báo rõ.
 */
export function DocumentReader({ document: d, onDownload }: { document: DocumentItem; onDownload?: () => void }) {
  const t = useTranslations("reader");

  if ((d.type === "pdf" || d.type === "pptx") && d.previewUrl) {
    return (
      <div className="grid gap-3">
        {d.type === "pptx" ? <p className="text-center text-xs text-muted-foreground">{t("convertedFromPptx")}</p> : null}
        <PdfReader url={d.previewUrl} title={d.title} />
      </div>
    );
  }
  if (d.type === "docx" && d.fileUrl) return <DocxReader url={d.fileUrl} />;
  if (d.type === "xlsx" && d.fileUrl) return <XlsxReader url={d.fileUrl} />;
  if (d.type === "image" && d.fileUrl) return <ImageReader url={d.fileUrl} title={d.title} />;
  if (d.type === "video" && d.fileUrl) return <VideoReader url={d.fileUrl} title={d.title} />;

  return <DocumentPreview document={d} onDownload={onDownload} />;
}
