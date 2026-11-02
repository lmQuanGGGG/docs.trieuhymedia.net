import type { Metadata } from "next";
import { getFormatter, getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { FileTypeIcon } from "@/components/documents/file-type-icon";
import { PublicShell, PublicUnavailable } from "@/components/share/public-shell";
import { ShareUnlockForm } from "@/components/share/share-unlock-form";
import { IconTile } from "@/components/shared/icon-tile";
import { MemberAvatar } from "@/components/shared/member-avatar";
import { Link } from "@/i18n/navigation";
import { initPage } from "@/i18n/page";
import { collectionCookieName, getPublicCollection } from "@/server/services/collections";

export async function generateMetadata({ params }: PageProps<"/[locale]/share/c/[token]">): Promise<Metadata> {
  const { token } = await params;
  const result = await getPublicCollection(token, (await cookies()).get(collectionCookieName(token))?.value, false);
  if (result.state !== "ok") return { robots: { index: false, follow: false } };
  return { title: result.data.title, description: result.data.description, robots: { index: false, follow: false } };
}

/** Trang bộ chia sẻ: lưới tài liệu, bấm vào để xem từng tài liệu */
export default async function CollectionPage({ params }: PageProps<"/[locale]/share/c/[token]">) {
  const locale = await initPage(params);
  const { token } = await params;
  const t = await getTranslations({ locale });
  const format = await getFormatter({ locale });
  const result = await getPublicCollection(token, (await cookies()).get(collectionCookieName(token))?.value, true);

  if (result.state !== "ok") {
    return (
      <PublicShell locale={locale}>
        {result.state === "locked" ? (
          <ShareUnlockForm unlockUrl={`/api/share/c/${encodeURIComponent(token)}/unlock`} />
        ) : (
          <PublicUnavailable locale={locale} />
        )}
      </PublicShell>
    );
  }

  const { title, description, owner, documents } = result.data;
  return (
    <PublicShell locale={locale}>
      <div className="grid gap-8 sm:gap-10">
        <section className="relative">
          <div aria-hidden className="absolute inset-x-8 -bottom-3 h-12 rounded-[28px] bg-card/60 shadow-soft" />
          <div className="surface relative rounded-[28px] p-6 sm:p-10">
            <p className="text-xs font-medium tracking-wider text-brand uppercase">{t("publicCollection.eyebrow")}</p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h1>
            {description ? <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground text-pretty">{description}</p> : null}
            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <MemberAvatar member={owner} size="xs" />
                {t("publicShare.presentedBy", { name: owner.name })}
              </span>
              <span>{t("common.documentsCount", { count: documents.length })}</span>
            </div>
          </div>
        </section>

        {documents.length === 0 ? (
          <p className="surface p-10 text-center text-sm text-muted-foreground">{t("publicCollection.empty")}</p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {documents.map((d) => (
              <li key={d.id}>
                <Link
                  href={`/share/c/${token}/${d.id}`}
                  className="surface surface-interactive flex h-full flex-col gap-4 p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <IconTile name={d.category} size="sm" />
                    <FileTypeIcon type={d.type} size="sm" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">
                      {t(`categories.${d.category}.name`)} · {d.brand}
                    </p>
                    <h2 className="mt-1.5 line-clamp-2 font-semibold leading-snug text-balance">{d.title}</h2>
                    {d.description ? <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{d.description}</p> : null}
                  </div>
                  <p className="mt-auto text-xs text-muted-foreground">
                    {format.dateTime(new Date(d.updatedAt), { dateStyle: "medium" })}
                    {d.pages ? ` · ${t("common.pagesCount", { count: d.pages })}` : ""}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PublicShell>
  );
}
