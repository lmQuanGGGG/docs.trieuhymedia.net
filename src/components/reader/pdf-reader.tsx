"use client";

import { ExternalLink, Maximize2, Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ReaderError } from "./reader-states";

const ZOOM_STEPS = [0.6, 0.75, 0.9, 1, 1.15, 1.3, 1.5] as const;
const MAX_PAGE_WIDTH = 880;
const OVERSAMPLE = 1.5;
/** ~16 triệu điểm ảnh mỗi trang (≈64MB RAM), dưới giới hạn canvas của Safari iOS */
const MAX_CANVAS_PIXELS = 16_000_000;

interface PageSize {
  width: number;
  height: number;
}

/** Một trang PDF: chỉ render canvas khi trang gần vào khung nhìn */
function PdfPage({
  doc,
  index,
  size,
  width,
  onVisible,
}: {
  doc: PDFDocumentProxy;
  index: number;
  size: PageSize;
  width: number;
  onVisible: (page: number) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Hai trang đầu vẽ ngay, các trang sau vẽ khi cuộn tới
  const [near, setNear] = useState(index < 2);
  const height = Math.round((width * size.height) / size.width);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const lazy = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "800px 0px" });
    const current = new IntersectionObserver(([e]) => e.isIntersecting && onVisible(index + 1), { threshold: 0.5 });
    lazy.observe(el);
    current.observe(el);
    return () => {
      lazy.disconnect();
      current.disconnect();
    };
  }, [index, onVisible]);

  useEffect(() => {
    if (!near || !canvasRef.current || width <= 0) return;
    let task: RenderTask | null = null;
    let cancelled = false;
    (async () => {
      const page = await doc.getPage(index + 1);
      if (cancelled || !canvasRef.current) return;
      // Vẽ dư độ phân giải (1.5× mật độ điểm ảnh) để chữ sắc nét cả khi trình duyệt
      // đang zoom hoặc màn hình có hệ số lẻ; giới hạn số điểm ảnh để không tốn bộ nhớ.
      const cssScale = width / size.width;
      let outputScale = Math.max(window.devicePixelRatio || 1, 1) * OVERSAMPLE;
      const pixels = size.width * cssScale * outputScale * size.height * cssScale * outputScale;
      if (pixels > MAX_CANVAS_PIXELS) outputScale *= Math.sqrt(MAX_CANVAS_PIXELS / pixels);
      const viewport = page.getViewport({ scale: cssScale * outputScale });
      const canvas = canvasRef.current;
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      task = page.render({ canvas, viewport });
      await task.promise.catch(() => undefined);
    })();
    return () => {
      cancelled = true;
      task?.cancel();
    };
  }, [near, doc, index, width, size.width, size.height]);

  return (
    <div
      ref={wrapRef}
      data-page={index + 1}
      style={{ width, height }}
      className="relative mx-auto overflow-hidden rounded-md bg-white shadow-soft"
    >
      {near ? <canvas ref={canvasRef} className="block size-full" /> : null}
    </div>
  );
}

/**
 * Đọc PDF ngay trên trang như lướt web: các trang xếp dọc, cuộn theo trang,
 * vẽ lười bằng pdf.js. Thanh công cụ dính dưới header.
 */
export function PdfReader({ url, title }: { url: string; title: string }) {
  const t = useTranslations("reader");
  const boxRef = useRef<HTMLDivElement>(null);
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [sizes, setSizes] = useState<PageSize[]>([]);
  const [failed, setFailed] = useState(false);
  const [boxWidth, setBoxWidth] = useState(0);
  const [zoomIndex, setZoomIndex] = useState(3);
  const [current, setCurrent] = useState(1);

  useEffect(() => {
    let destroyed = false;
    let loaded: PDFDocumentProxy | null = null;
    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        loaded = await pdfjs.getDocument({ url }).promise;
        const list: PageSize[] = [];
        for (let i = 1; i <= loaded.numPages; i += 1) {
          const vp = (await loaded.getPage(i)).getViewport({ scale: 1 });
          list.push({ width: vp.width, height: vp.height });
        }
        if (destroyed) return;
        setSizes(list);
        setDoc(loaded);
      } catch {
        if (!destroyed) setFailed(true);
      }
    })();
    return () => {
      destroyed = true;
      void loaded?.destroy();
    };
  }, [url]);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const measure = () => setBoxWidth(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const zoom = ZOOM_STEPS[zoomIndex];
  const pageWidth = Math.round(Math.min(boxWidth, MAX_PAGE_WIDTH) * zoom);

  if (failed) return <ReaderError url={url} />;

  return (
    <div className="relative">
      <div className="glass sticky top-16 z-10 mx-auto mb-4 flex w-fit items-center gap-1 rounded-xl p-1 shadow-lift">
        <span className="px-2.5 text-xs font-medium tabular-nums text-muted-foreground">
          {doc ? t("page", { current, total: doc.numPages }) : "…"}
        </span>
        <span className="h-4 w-px bg-border" aria-hidden />
        <Button variant="ghost" size="icon-sm" onClick={() => setZoomIndex((z) => Math.max(0, z - 1))} disabled={zoomIndex === 0} aria-label={t("zoomOut")}>
          <Minus />
        </Button>
        <button type="button" onClick={() => setZoomIndex(3)} className="w-12 text-center text-xs font-medium tabular-nums" aria-label={t("fitWidth")}>
          {Math.round(zoom * 100)}%
        </button>
        <Button variant="ghost" size="icon-sm" onClick={() => setZoomIndex((z) => Math.min(ZOOM_STEPS.length - 1, z + 1))} disabled={zoomIndex === ZOOM_STEPS.length - 1} aria-label={t("zoomIn")}>
          <Plus />
        </Button>
        <span className="h-4 w-px bg-border" aria-hidden />
        <Button variant="ghost" size="icon-sm" onClick={() => setZoomIndex(3)} aria-label={t("fitWidth")}>
          <Maximize2 />
        </Button>
        <Button variant="ghost" size="icon-sm" asChild>
          <a href={url} target="_blank" rel="noopener noreferrer" aria-label={t("openInNewTab")}>
            <ExternalLink />
          </a>
        </Button>
      </div>

      <div ref={boxRef} className={cn("w-full", zoom > 1 && "overflow-x-auto")} aria-label={title}>
        {doc && pageWidth > 0 ? (
          <div className="flex flex-col gap-4 pb-2" style={{ minWidth: pageWidth }}>
            {sizes.map((size, i) => (
              <PdfPage key={i} doc={doc} index={i} size={size} width={pageWidth} onVisible={setCurrent} />
            ))}
          </div>
        ) : (
          <div className="mx-auto grid max-w-[880px] gap-4" aria-busy="true">
            <Skeleton className="aspect-[1/1.414] w-full rounded-md" />
          </div>
        )}
      </div>
    </div>
  );
}
