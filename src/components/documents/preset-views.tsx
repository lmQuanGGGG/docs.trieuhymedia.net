"use client";

import { useTranslations } from "next-intl";
import { IconTile } from "@/components/shared/icon-tile";
import type { CategorySlug, DocumentItem } from "@/types";
import { DocumentsView } from "./documents-view";

const RECENT_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;
const isRecent = (d: DocumentItem) => new Date(d.updatedAt).getTime() >= Date.now() - RECENT_WINDOW_MS;
const isStarred = (d: DocumentItem) => d.starred;
const isShared = (d: DocumentItem) => d.sharedWithMe;

export function AllDocumentsView() {
  const t = useTranslations("documents");
  return <DocumentsView title={t("allTitle")} description={t("allDescription")} showFolders />;
}

export function RecentView() {
  const t = useTranslations("documents");
  return <DocumentsView title={t("recentTitle")} description={t("recentDescription")} scope={isRecent} />;
}

export function StarredView() {
  const t = useTranslations("documents");
  return <DocumentsView title={t("starredTitle")} description={t("starredDescription")} scope={isStarred} emptyKind="starred" />;
}

export function SharedView() {
  const t = useTranslations("documents");
  return <DocumentsView title={t("sharedTitle")} description={t("sharedDescription")} scope={isShared} />;
}

export function CategoryView({ slug }: { slug: CategorySlug }) {
  const t = useTranslations("categories");
  return (
    <DocumentsView
      key={slug}
      title={t(`${slug}.name`)}
      description={t(`${slug}.description`)}
      category={slug}
      leading={<IconTile name={slug} size="lg" />}
    />
  );
}
