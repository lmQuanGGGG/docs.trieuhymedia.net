import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { PublicDocView } from "@/components/share/public-doc-view";
import { PublicShell, PublicUnavailable } from "@/components/share/public-shell";
import { ShareUnlockForm } from "@/components/share/share-unlock-form";
import { initPage } from "@/i18n/page";
import { collectionCookieName, getPublicCollection } from "@/server/services/collections";

async function load(token: string, docId: string) {
  const result = await getPublicCollection(token, (await cookies()).get(collectionCookieName(token))?.value, false);
  if (result.state !== "ok") return { result, doc: undefined };
  return { result, doc: result.data.documents.find((d) => d.id === docId) };
}

export async function generateMetadata({ params }: PageProps<"/[locale]/share/c/[token]/[docId]">): Promise<Metadata> {
  const { token, docId } = await params;
  const { doc } = await load(token, docId);
  return doc ? { title: doc.title, robots: { index: false, follow: false } } : { robots: { index: false, follow: false } };
}

/** Xem một tài liệu trong bộ chia sẻ, có nút quay lại danh sách */
export default async function CollectionDocPage({ params }: PageProps<"/[locale]/share/c/[token]/[docId]">) {
  const locale = await initPage(params);
  const { token, docId } = await params;
  const t = await getTranslations({ locale });
  const { result, doc } = await load(token, docId);

  return (
    <PublicShell locale={locale}>
      {result.state === "locked" ? (
        <ShareUnlockForm unlockUrl={`/api/share/c/${encodeURIComponent(token)}/unlock`} />
      ) : result.state === "ok" && doc ? (
        <PublicDocView
          locale={locale}
          document={doc}
          owner={result.data.owner}
          allowDownload={result.data.allowDownload}
          back={{ href: `/share/c/${token}`, label: t("publicCollection.back", { title: result.data.title }) }}
        />
      ) : (
        <PublicUnavailable locale={locale} />
      )}
    </PublicShell>
  );
}
