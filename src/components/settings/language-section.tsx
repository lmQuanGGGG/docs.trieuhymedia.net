"use client";

import { Check } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useChangeLocale } from "@/components/layout/locale-switcher";
import { localeLabels, locales } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { SettingsCard } from "./settings-card";

const samples = { vi: "Xin chào", en: "Hello", "zh-CN": "你好" } as const;

export function LanguageSection() {
  const t = useTranslations("settings.language");
  const locale = useLocale();
  const { change, isPending } = useChangeLocale();

  return (
    <SettingsCard title={t("title")} description={t("description")}>
      <div className={cn("grid gap-3 sm:grid-cols-3", isPending && "opacity-60")} role="radiogroup" aria-label={t("title")}>
        {locales.map((l) => {
          const selected = l === locale;
          return (
            <button
              key={l}
              type="button"
              role="radio"
              lang={l}
              aria-checked={selected}
              onClick={() => change(l)}
              className={cn(
                "relative flex items-center gap-3 rounded-xl bg-muted/50 p-4 text-left transition-all hover:bg-muted",
                selected && "bg-card shadow-lift ring-2 ring-brand/50",
              )}
            >
              <span className="grid size-10 place-items-center rounded-lg bg-brand-soft text-sm font-semibold text-brand">
                {samples[l].slice(0, 2)}
              </span>
              <span>
                <span className="block text-sm font-medium">{localeLabels[l]}</span>
                <span className="block text-xs text-muted-foreground">{samples[l]}</span>
              </span>
              {selected ? <Check className="ml-auto size-4 text-brand" /> : null}
            </button>
          );
        })}
      </div>
    </SettingsCard>
  );
}
