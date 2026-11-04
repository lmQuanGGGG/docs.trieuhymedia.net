"use client";

import { ArrowLeft, Download, Share2, Star } from "lucide-react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { type ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { MemberAvatar } from "@/components/shared/member-avatar";
import { Link } from "@/i18n/navigation";
import { formatBytes } from "@/lib/format";
import { useWorkspace } from "@/lib/store/workspace-store";
import { cn } from "@/lib/utils";
import { StatusBadge, VisibilityLabel } from "./badges";
import { DocumentCard } from "./document-card";
import { DocumentActionsMenu } from "./document-menu";
import { DocumentReader } from "@/components/reader/document-reader";
import { LanguageSwitch } from "@/components/reader/language-switch";
import { availableLocales, defaultLocaleFor, documentForLocale } from "@/lib/doc-url";
import { StatusSelect } from "./status-select";
import { VariantsPanel } from "./variants-panel";
import { FileTypeIcon } from "./file-type-icon";
import { useDocumentActions } from "./use-document-actions";

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 text-sm shadow-[inset_0_-1px_0_var(--border)] last:shadow-none">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-right">{children}</dd>
    </div>
  );
}

export function DocumentDetailView({ id }: { id: string }) {
  const t = useTranslations();
  const format = useFormatter();
  const locale = useLocale();
  const { getDocument, getMember, documents, status } = useWorkspace();
  const actions = useDocumentActions();
  const doc = getDocument(id);
  const [chosenLang, setLang] = useState<string | null>(null);

  if (status === "loading") {
    return (
      <div className="grid grid-cols-1 gap-6" aria-busy="true">
        <div className="flex items-center gap-4">
          <Skeleton className="size-12 rounded-xl" />
          <div className="grid flex-1 gap-2">
            <Skeleton className="h-6 w-2/3 max-w-md" />
            <Skeleton className="h-4 w-1/3 max-w-xs" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <Skeleton className="h-[460px] rounded-2xl" />
          <Skeleton className="h-[460px] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="surface">
        <EmptyState
          icon="file-question"
          title={t("detail.notFoundTitle")}
          description={t("detail.notFoundDescription")}
          action={
            <Button asChild variant="secondary">
              <Link href="/documents">
                <ArrowLeft /> {t("detail.backToDocuments")}
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  const owner = getMember(doc.ownerId);
  const langs = availableLocales(doc);
  const lang = chosenLang && langs.includes(chosenLang) ? chosenLang : defaultLocaleFor(doc, locale);
  const view = documentForLocale(doc, lang);
  const actionBar = (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => void actions.toggleStar(doc)}
        aria-pressed={doc.starred}
        aria-label={doc.starred ? t("documents.actions.unstar") : t("documents.actions.star")}
      >
        <Star className={cn(doc.starred && "fill-warning text-warning")} />
      </Button>
      <Button variant="secondary" className="flex-1" onClick={() => actions.download(view)}>
        <Download /> {t("common.download")}
      </Button>
      {doc.can?.share ? (
        <Button className="flex-1" onClick={() => actions.share(doc)}>
          <Share2 /> {t("common.share")}
        </Button>
      ) : null}
      <DocumentActionsMenu document={doc} />
    </div>
  );
  const related = documents
    .filter((d) => d.id !== doc.id && (d.category === doc.category || d.brand === doc.brand))
    .slice(0, 4);
  const date = (iso: string) => format.dateTime(new Date(iso), { dateStyle: "medium" });

  return (
    <div className="grid grid-cols-1 gap-6 lg:gap-8">
      {/* Tiêu đề */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 gap-4">
          <FileTypeIcon type={doc.type} size="lg" />
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight text-balance sm:text-2xl">{doc.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
              <span>{t(`categories.${doc.category}.name`)}</span>
              <span aria-hidden>·</span>
              <span>{doc.brand}</span>
              <span aria-hidden>·</span>
              <StatusBadge status={doc.status} />
            </div>
          </div>
        </div>
        {/* Màn nhỏ: nhóm nút ở đầu trang; màn lớn: nằm trong panel bên phải (dính khi cuộn) */}
        <div className="lg:hidden">{actionBar}</div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        {/* Xem trước */}
        <section aria-label={t("detail.preview")} className="min-w-0">
          {doc.description ? <p className="mb-5 max-w-3xl text-[15px] leading-relaxed text-muted-foreground text-pretty">{doc.description}</p> : null}
          <LanguageSwitch locales={langs} original={doc.locale} value={lang} onChange={setLang} />
          <DocumentReader key={lang} document={view} onDownload={() => actions.download(view)} />
        </section>

        {/* Panel thông tin */}
        <aside className="grid gap-4 lg:sticky lg:top-20 lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto lg:pb-1">
          <section className="surface hidden p-3 lg:block">{actionBar}</section>
          <section className="surface p-5">
            <h2 className="mb-1 text-sm font-semibold">{t("detail.details")}</h2>
            <dl>
              <InfoRow label={t("detail.owner")}>
                <span className="inline-flex items-center gap-2">
                  <MemberAvatar member={owner} size="xs" />
                  <span className="truncate">{owner?.name}</span>
                </span>
              </InfoRow>
              <InfoRow label={t("documents.columns.status")}>
                <StatusSelect document={doc} />
              </InfoRow>
              <InfoRow label={t("documents.columns.visibility")}>
                <VisibilityLabel visibility={doc.visibility} className="text-foreground" />
              </InfoRow>
              <InfoRow label={t("documents.columns.type")}>{t(`documentTypes.${doc.type}`)}</InfoRow>
              <InfoRow label={t("detail.size")}>{formatBytes(doc.sizeBytes, locale)}</InfoRow>
              {doc.pages ? <InfoRow label={t("detail.pages")}>{format.number(doc.pages)}</InfoRow> : null}
              <InfoRow label={t("detail.created")}>{date(doc.createdAt)}</InfoRow>
              <InfoRow label={t("detail.updated")}>{date(doc.updatedAt)}</InfoRow>
              {doc.tags.length ? (
                <InfoRow label={t("detail.tags")}>
                  <span className="flex flex-wrap justify-end gap-1">
                    {doc.tags.map((tag) => (
                      <span key={tag} className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                        #{tag}
                      </span>
                    ))}
                  </span>
                </InfoRow>
              ) : null}
            </dl>
          </section>

          <VariantsPanel document={doc} />

          <section className="surface p-5">
            <h2 className="mb-3 text-sm font-semibold">{t("detail.versions")}</h2>
            {doc.versions.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("detail.noVersions")}</p>
            ) : (
              <ol className="relative grid gap-4 before:absolute before:top-2 before:bottom-2 before:left-[13px] before:w-px before:bg-border">
                {doc.versions.map((v, i) => (
                  <li key={v.version} className="relative flex gap-3">
                    <MemberAvatar member={getMember(v.authorId)} size="sm" className="ring-4 ring-card" />
                    <div className="min-w-0 text-sm">
                      <p className="flex flex-wrap items-center gap-2 font-medium">
                        {t("common.versionLabel", { version: v.version })}
                        {i === 0 ? (
                          <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-medium text-brand">{t("detail.current")}</span>
                        ) : null}
                      </p>
                      <p className="text-muted-foreground">{v.note}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {date(v.createdAt)} · {formatBytes(v.sizeBytes, locale)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </aside>
      </div>

      <section>
        <h2 className="mb-3 text-[15px] font-semibold tracking-tight">{t("detail.related")}</h2>
        {related.length ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {related.map((d) => (
              <DocumentCard key={d.id} document={d} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t("detail.noRelated")}</p>
        )}
      </section>
    </div>
  );
}
