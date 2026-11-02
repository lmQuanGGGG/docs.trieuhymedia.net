import { Mail, MapPin, Phone } from "lucide-react";
import type { Metadata } from "next";
import { getFormatter, getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { PublicDownloadButton, PublicPreview } from "@/components/share/public-preview";
import { IconTile } from "@/components/shared/icon-tile";
import { Logo } from "@/components/shared/logo";
import { MemberAvatar } from "@/components/shared/member-avatar";
import { company } from "@/config/company";
import { initPage } from "@/i18n/page";
import { cookies, headers } from "next/headers";
import { ShareUnlockForm } from "@/components/share/share-unlock-form";
import { getPublicShare, shareCookieName } from "@/server/services/share";

export async function generateMetadata({ params }: PageProps<"/[locale]/share/[token]">): Promise<Metadata> {
  const { token } = await params;
  const unlock = (await cookies()).get(shareCookieName(token))?.value;
  const result = await getPublicShare(token, unlock, {}, false);
  if (result.state !== "ok") return { robots: { index: false, follow: false } };
  return {
    title: result.data.document.title,
    description: result.data.document.description,
    robots: { index: false, follow: false },
  };
}

export default async function SharePage({ params }: PageProps<"/[locale]/share/[token]">) {
  const locale = await initPage(params);
  const { token } = await params;
  const t = await getTranslations({ locale });
  const format = await getFormatter({ locale });
  const headerList = await headers();
  const result = await getPublicShare(token, (await cookies()).get(shareCookieName(token))?.value, {
    userAgent: headerList.get("user-agent") ?? undefined,
    country: headerList.get("cf-ipcountry") ?? headerList.get("x-vercel-ip-country") ?? undefined,
  });
  const shared = result.state === "ok" ? result.data : null;

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="glass sticky top-0 z-20 shadow-[0_1px_0_var(--border)]">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <a href={company.website} target="_blank" rel="noopener noreferrer" className="min-w-0">
            <Logo />
          </a>
          <div className="flex items-center gap-0.5">
            <LocaleSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        {shared ? (
          (() => {
            const { document: doc, owner, allowDownload } = shared;
            return (
              <article className="grid gap-8 sm:gap-10">
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
                        <PublicDownloadButton document={doc} allowed={allowDownload} />
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
                  <PublicPreview document={doc} allowDownload={allowDownload} />
                </section>
              </article>
            );
          })()
        ) : result.state === "locked" ? (
          <ShareUnlockForm token={token} />
        ) : (
          <div className="surface mx-auto grid max-w-lg justify-items-center gap-4 p-10 text-center">
            <IconTile name="link-off" size="lg" />
            <h1 className="text-lg font-semibold">{t("publicShare.notFoundTitle")}</h1>
            <p className="text-sm text-muted-foreground">{t("publicShare.notFoundDescription")}</p>
            <Button asChild variant="secondary">
              <a href={company.website}>{t("publicShare.goHome")}</a>
            </Button>
          </div>
        )}
      </main>

      <footer className="shadow-[0_-1px_0_var(--border)]">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 text-sm text-muted-foreground sm:px-6 md:grid-cols-[1fr_auto] md:items-end">
          <div className="grid gap-3">
            <Logo subtitle={t("publicShare.footerTagline")} />
            <p className="font-medium text-foreground">{company.legalName}</p>
            <p className="flex items-start gap-2"><MapPin className="mt-0.5 size-4 shrink-0" />{company.address}</p>
            <p className="flex flex-wrap gap-x-5 gap-y-1">
              <a href={`tel:${company.phone.replaceAll(" ", "")}`} className="inline-flex items-center gap-2 hover:text-foreground"><Phone className="size-4" />{company.phone}</a>
              <a href={`mailto:${company.email}`} className="inline-flex items-center gap-2 hover:text-foreground"><Mail className="size-4" />{company.email}</a>
            </p>
          </div>
          <div className="grid gap-1 md:text-right">
            <p>{t("publicShare.taxId")}: {company.taxId}</p>
            <p>{t("publicShare.rights", { year: 2026 })}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
