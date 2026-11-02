"use client";

import { Languages } from "lucide-react";
import { useTranslations } from "next-intl";
import { type Locale, localeLabels } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/** Chọn bản ngôn ngữ của tài liệu để đọc */
export function LanguageSwitch({
  locales,
  original,
  value,
  onChange,
}: {
  locales: string[];
  original: string;
  value: string;
  onChange: (locale: string) => void;
}) {
  const t = useTranslations("reader");
  if (locales.length < 2) return null;
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2" role="radiogroup" aria-label={t("languages")}>
      <Languages className="size-4 text-muted-foreground" aria-hidden />
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          role="radio"
          lang={l}
          aria-checked={value === l}
          onClick={() => onChange(l)}
          className={cn(
            "rounded-full px-3 py-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
            value === l && "bg-brand-soft text-brand hover:bg-brand-soft hover:text-brand",
          )}
        >
          {localeLabels[l as Locale] ?? l}
          {l === original ? <span className="ml-1 text-xs font-normal opacity-70">· {t("original")}</span> : null}
        </button>
      ))}
    </div>
  );
}
