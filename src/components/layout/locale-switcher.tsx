"use client";

import { Check, Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "@/i18n/navigation";
import { type Locale, localeLabels, locales } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const shortLabels: Record<Locale, string> = { vi: "VI", en: "EN", "zh-CN": "中" };

export function useChangeLocale() {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const change = (next: Locale) =>
    startTransition(() => {
      router.replace(pathname, { locale: next, scroll: false });
    });
  return { change, isPending };
}

export function LocaleSwitcher({ className }: { className?: string }) {
  const t = useTranslations("header");
  const locale = useLocale();
  const { change, isPending } = useChangeLocale();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={t("language")}
          className={cn("gap-1.5 px-2 text-muted-foreground", isPending && "opacity-60", className)}
        >
          <Languages className="size-4" />
          <span className="text-xs font-semibold">{shortLabels[locale]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>{t("language")}</DropdownMenuLabel>
        {locales.map((l) => (
          <DropdownMenuItem key={l} onSelect={() => change(l)} lang={l}>
            <span className="flex-1">{localeLabels[l]}</span>
            {l === locale ? <Check className="size-4 text-brand" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
