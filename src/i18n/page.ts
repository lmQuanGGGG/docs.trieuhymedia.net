import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { NavLabelKey } from "@/config/navigation";
import { type Locale, routing } from "./routing";

/** Xác thực locale từ params và bật static rendering cho trang */
export async function initPage(params: Promise<{ locale: string }>): Promise<Locale> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return locale;
}

export async function navMetadata(params: Promise<{ locale: string }>, key: NavLabelKey): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: hasLocale(routing.locales, locale) ? locale : routing.defaultLocale, namespace: "nav" });
  return { title: t(key) };
}
