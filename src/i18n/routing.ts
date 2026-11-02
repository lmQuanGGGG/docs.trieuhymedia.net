import { defineRouting } from "next-intl/routing";

export const locales = ["vi", "en", "zh-CN"] as const;
export type Locale = (typeof locales)[number];

export const localeLabels: Record<Locale, string> = {
  vi: "Tiếng Việt",
  en: "English",
  "zh-CN": "简体中文",
};

export const routing = defineRouting({
  locales,
  defaultLocale: "vi",
  localePrefix: "always",
  localeCookie: { name: "NEXT_LOCALE", maxAge: 60 * 60 * 24 * 365 },
});
