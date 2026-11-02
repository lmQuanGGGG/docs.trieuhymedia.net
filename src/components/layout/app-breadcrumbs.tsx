"use client";

import { useTranslations } from "next-intl";
import { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { isCategorySlug } from "@/config/categories";
import type { NavLabelKey } from "@/config/navigation";
import { Link, usePathname } from "@/i18n/navigation";
import { useWorkspace } from "@/lib/store/workspace-store";

interface Crumb {
  label: string;
  href?: string;
}

const topLevel: Record<string, NavLabelKey> = {
  documents: "allDocuments",
  recent: "recent",
  starred: "starred",
  shared: "shared",
  team: "team",
  activity: "activity",
  settings: "settings",
};

export function useBreadcrumbs(): Crumb[] {
  const t = useTranslations();
  const pathname = usePathname();
  const { getDocument } = useWorkspace();
  const [first, second] = pathname.split("/").filter(Boolean);

  const crumbs: Crumb[] = [{ label: t("nav.overview"), href: "/" }];
  if (!first) return [{ label: t("nav.overview") }];

  if (first === "categories" && second && isCategorySlug(second)) {
    crumbs.push({ label: t("nav.allDocuments"), href: "/documents" });
    crumbs.push({ label: t(`categories.${second}.name`) });
    return crumbs;
  }

  const key = topLevel[first];
  if (key) crumbs.push({ label: t(`nav.${key}`), href: second ? `/${first}` : undefined });

  if (first === "documents" && second) {
    crumbs.push({ label: getDocument(second)?.title ?? "…" });
  }
  return crumbs;
}

export function AppBreadcrumbs() {
  const crumbs = useBreadcrumbs();
  const t = useTranslations("nav");

  return (
    <Breadcrumb className="min-w-0">
      <BreadcrumbList className="flex-nowrap">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <Fragment key={`${c.label}-${i}`}>
              {/* Mobile: chỉ hiện mục cuối */}
              <BreadcrumbItem className={last ? "min-w-0" : "hidden shrink-0 whitespace-nowrap lg:inline-flex"}>
                {last || !c.href ? (
                  <BreadcrumbPage className="truncate font-medium">{c.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={c.href}>{c.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!last ? <BreadcrumbSeparator className="hidden lg:inline-flex" /> : null}
            </Fragment>
          );
        })}
      </BreadcrumbList>
      <span className="sr-only">{t("home")}</span>
    </Breadcrumb>
  );
}
