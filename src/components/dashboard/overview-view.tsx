"use client";

import { ArrowRight } from "lucide-react";
import type { Icon3DName } from "@/components/icons3d";
import { useTranslations } from "next-intl";
import type { CSSProperties } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { DocumentTable } from "@/components/documents/document-table";
import { TableSkeleton } from "@/components/documents/document-skeletons";
import { IconTile } from "@/components/shared/icon-tile";
import { categories } from "@/config/categories";
import { Link } from "@/i18n/navigation";
import { useNow } from "@/lib/use-now";
import { type DialogState, useDialogs } from "@/lib/store/dialogs-store";
import { useWorkspace } from "@/lib/store/workspace-store";
import { brands } from "@/types";
import { FeaturedStack } from "./featured-stack";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function greetingKey(): "greetingMorning" | "greetingAfternoon" | "greetingEvening" {
  // Theo giờ Việt Nam để server và client cho cùng kết quả
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date()));
  if (hour < 11) return "greetingMorning";
  if (hour < 18) return "greetingAfternoon";
  return "greetingEvening";
}

function SectionTitle({ title, href, linkLabel }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-4">
      <h2 className="text-[15px] font-semibold tracking-tight">{title}</h2>
      {href && linkLabel ? (
        <Link href={href} className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline">
          {linkLabel} <ArrowRight className="size-3.5" />
        </Link>
      ) : null}
    </div>
  );
}

export function OverviewView() {
  const t = useTranslations();
  const { documents, currentUser, status, canCreate } = useWorkspace();
  const { open } = useDialogs();
  const ready = status === "ready";

  const cutoff = useNow() - WEEK_MS;
  const metrics = [
    { key: "total", value: documents.length, hint: t("overview.metrics.totalHint", { count: brands.length }), icon: "stack" },
    { key: "proposals", value: documents.filter((d) => d.category === "proposals" && (d.status === "draft" || d.status === "review")).length, hint: t("overview.metrics.proposalsHint"), icon: "proposals" },
    { key: "shared", value: documents.filter((d) => d.visibility === "public").length, hint: t("overview.metrics.sharedHint"), icon: "globe" },
    { key: "recent", value: documents.filter((d) => new Date(d.updatedAt).getTime() >= cutoff).length, hint: t("overview.metrics.recentHint"), icon: "clock" },
  ] as const;

  const quickActions: Array<{ key: "newDocument" | "upload" | "folder" | "share"; dialog: Exclude<DialogState, null>; icon: Icon3DName }> = [
    { key: "newDocument", dialog: { kind: "newDocument" }, icon: "doc-new" },
    { key: "upload", dialog: { kind: "upload" }, icon: "upload" },
    { key: "folder", dialog: { kind: "folder" }, icon: "folder" },
    { key: "share", dialog: { kind: "share" }, icon: "share" },
  ];

  const recent = [...documents].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 6);
  const featured = documents.filter((d) => d.starred).slice(0, 5);
  const firstName = currentUser?.name.split(" ").at(-1) ?? "";

  return (
    <div className="grid grid-cols-1 gap-8 lg:gap-10">
      {/* Hero xếp lớp */}
      <section className="relative">
        <div aria-hidden className="absolute inset-x-6 -bottom-3 h-12 rounded-[28px] bg-card/60 shadow-soft sm:inset-x-10" />
        <div className="surface relative grid grid-cols-1 gap-6 overflow-hidden rounded-[28px] p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-center lg:gap-10">
          <div className="relative min-w-0">
            <p className="text-xs font-medium tracking-wider text-brand uppercase">{t("overview.heroEyebrow")}</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
              {ready ? t(`overview.${greetingKey()}`, { name: firstName }) : <Skeleton className="h-8 w-64" />}
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground text-pretty sm:text-[15px]">
              {t("overview.subtitle")}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap">
              {quickActions.filter((a) => canCreate || a.key === "share").map((a) => (
                <button
                  key={a.key}
                  type="button"
                  onClick={() => open(a.dialog)}
                  className="group flex items-center gap-3 rounded-2xl bg-muted/60 p-2.5 pr-4 text-left transition-all hover:bg-card hover:shadow-lift"
                >
                  <IconTile name={a.icon} size="sm" />
                  <span className="min-w-0">
                    <span className="block text-[13px] leading-tight font-medium">{t(`overview.actions.${a.key}`)}</span>
                    <span className="hidden truncate text-xs text-muted-foreground sm:block">{t(`overview.actions.${a.key}Hint`)}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="relative min-w-0">
            <p className="mb-2 text-xs font-medium text-muted-foreground">{t("overview.heroPinned")}</p>
            {ready ? <FeaturedStack documents={featured} /> : <Skeleton className="h-[244px] w-[86%] rounded-[22px]" />}
          </div>
        </div>
      </section>

      {/* Chỉ số */}
      <section aria-label={t("overview.metrics.total")} className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.key} className="surface flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
            <IconTile name={m.icon} />
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-muted-foreground sm:text-[13px]">{t(`overview.metrics.${m.key}`)}</p>
              {ready ? (
                <p className="mt-0.5 text-2xl font-semibold tracking-tight tabular-nums">{m.value}</p>
              ) : (
                <Skeleton className="mt-1.5 h-7 w-12" />
              )}
              <p className="truncate text-xs text-muted-foreground">{m.hint}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Tài liệu gần đây */}
      <section>
        <SectionTitle title={t("overview.recentDocuments")} href="/recent" linkLabel={t("common.viewAll")} />
        <div className="surface overflow-hidden">
          {ready ? <DocumentTable documents={recent} selectable={false} compact /> : <TableSkeleton rows={6} />}
        </div>
      </section>

      {/* Danh mục nổi bật */}
      <section>
        <SectionTitle title={t("overview.featuredCategories")} href="/documents" linkLabel={t("nav.allDocuments")} />
        <div className="-mx-4 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pt-1 pb-3 scrollbar-none sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {categories.map((c) => {
            const count = documents.filter((d) => d.category === c.slug).length;
            return (
              <Link
                key={c.slug}
                href={`/categories/${c.slug}`}
                style={{ "--c": c.color } as CSSProperties}
                className="surface surface-interactive relative flex w-60 shrink-0 snap-start flex-col gap-4 overflow-hidden p-5 sm:w-auto"
              >
                <IconTile name={c.slug} size="lg" />
                <div>
                  <p className="font-semibold">{t(`categories.${c.slug}.name`)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{t(`categories.${c.slug}.description`)}</p>
                </div>
                <p className="mt-auto text-xs font-medium text-muted-foreground">
                  {ready ? t("common.documentsCount", { count }) : "—"}
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
