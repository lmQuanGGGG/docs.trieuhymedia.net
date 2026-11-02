"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ReaderError } from "./reader-states";

/** Hiển thị nội dung Word dạng dòng chảy liên tục như một trang web (docx-preview) */
export function DocxReader({ url }: { url: string }) {
  const t = useTranslations("reader");
  const bodyRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [{ renderAsync }, res] = await Promise.all([import("docx-preview"), fetch(url)]);
        if (!res.ok) throw new Error(String(res.status));
        const blob = await res.blob();
        if (cancelled || !bodyRef.current) return;
        bodyRef.current.innerHTML = "";
        await renderAsync(blob, bodyRef.current, undefined, {
          className: "docx",
          inWrapper: false,
          ignoreWidth: true,
          ignoreHeight: true,
          breakPages: false,
          useBase64URL: true,
        });
        if (!cancelled) setState("ready");
      } catch {
        if (!cancelled) setState("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (state === "error") return <ReaderError url={url} />;

  return (
    <div className="mx-auto w-full max-w-[880px] rounded-md bg-white text-[#18181b] shadow-soft">
      {state === "loading" ? (
        <div className="grid gap-3 p-10" aria-busy="true" aria-label={t("loading")}>
          <Skeleton className="h-7 w-2/3 bg-zinc-100" />
          <Skeleton className="h-4 w-full bg-zinc-100" />
          <Skeleton className="h-4 w-11/12 bg-zinc-100" />
          <Skeleton className="h-4 w-4/5 bg-zinc-100" />
        </div>
      ) : null}
      {/* Nội dung do docx-preview dựng; giữ nền giấy trắng ở cả chế độ tối */}
      <div
        ref={bodyRef}
        className="docx-reader overflow-x-auto px-5 py-8 sm:px-12 sm:py-12 [&_.docx]:!w-auto [&_.docx]:!max-w-none [&_.docx]:!p-0 [&_table]:max-w-full"
      />
    </div>
  );
}
