import { ArrowLeft, Mail } from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { IconTile } from "@/components/shared/icon-tile";
import { MemberAvatar } from "@/components/shared/member-avatar";
import { company } from "@/config/company";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { DocumentItem, Member } from "@/types";
import { PublicDocumentProvider, PublicDownloadButton, PublicPreview } from "./public-preview";

/** Phần thân trang xem một tài liệu công khai (dùng cho link lẻ và trong bộ chia sẻ) */
export async function PublicDocView({
  locale,
  document: doc,
  owner,
  allowDownload,
  back,
}: {
  locale: Locale;
  document: DocumentItem;
  owner?: Member;
  allowDownload: boolean;
  back?: { href: string; label: string };
}) {
  const t = await getTranslations({ locale });
  const format = await getFormatter({ locale });
  return (
    <PublicDocumentProvider document={doc}>
      <article className="grid gap-8 sm:gap-10">
        {back ? (
          <Button asChild variant="ghost" size="sm" className="-mb-4 justify-self-start text-muted-foreground">
            <Link href={back.href}>
              <ArrowLeft /> {back.label}
            </Link>
          </Button>
        ) : null}
        <section className="relative">
          <div aria-hidden className="absolute inset-x-8 -bottom-3 h-12 rounded-[28px] bg-card/60 shadow-soft" />
          <div className="surface relative overflow-hidden rounded-[28px] p-6 sm:p-10">
            <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <div className="flex items-center gap-3">
                  <IconTile name={doc.category} size="sm" />
                  <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                    {t(`categories.${doc.category}.name`)} · {doc.brand}
                  </span>
                </div>
                <h1 className="mt-5 text-2xl font-semibold tracking-tight text-balance sm:text-4xl">{doc.title}</h1>
                {doc.description ? (
                  <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground text-pretty">{doc.description}</p>
                ) : null}
                <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                  {owner ? (
                    <span className="inline-flex items-center gap-2">
                      <MemberAvatar member={owner} size="xs" />
                      {t("publicShare.presentedBy", { name: owner.name })}
                    </span>
                  ) : null}
                  <span>{t("publicShare.updated", { date: format.dateTime(new Date(doc.updatedAt), { dateStyle: "long" }) })}</span>
                  {doc.pages ? <span>{t("common.pagesCount", { count: doc.pages })}</span> : null}
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-start gap-2 md:items-end">
                <PublicDownloadButton allowed={allowDownload} />
                <Button asChild variant="ghost" size="sm">
                  <a href={`mailto:${company.email}?subject=${encodeURIComponent(doc.title)}`}>
                    <Mail /> {t("publicShare.contact")}
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>
        <section aria-label={t("detail.preview")}>
          <PublicPreview allowDownload={allowDownload} />
        </section>
      </article>
    </PublicDocumentProvider>
  );
}
