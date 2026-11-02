import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { CategoryView } from "@/components/documents/preset-views";
import { isCategorySlug } from "@/config/categories";
import { initPage } from "@/i18n/page";
import { routing } from "@/i18n/routing";
import { categorySlugs } from "@/types";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => categorySlugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/categories/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isCategorySlug(slug)) return {};
  const t = await getTranslations({ locale: locale as (typeof routing.locales)[number], namespace: "categories" });
  return { title: t(`${slug}.name`) };
}

export default async function CategoryPage({ params }: PageProps<"/[locale]/categories/[slug]">) {
  await initPage(params);
  const { slug } = await params;
  if (!isCategorySlug(slug)) notFound();
  return <CategoryView slug={slug} />;
}
