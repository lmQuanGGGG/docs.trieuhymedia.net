import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { PublicDocView } from "@/components/share/public-doc-view";
import { PublicShell, PublicUnavailable } from "@/components/share/public-shell";
import { ShareUnlockForm } from "@/components/share/share-unlock-form";
import { initPage } from "@/i18n/page";
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
  const headerList = await headers();
  const result = await getPublicShare(token, (await cookies()).get(shareCookieName(token))?.value, {
    userAgent: headerList.get("user-agent") ?? undefined,
    country: headerList.get("cf-ipcountry") ?? headerList.get("x-vercel-ip-country") ?? undefined,
  });

  return (
    <PublicShell locale={locale}>
      {result.state === "ok" ? (
        <PublicDocView locale={locale} document={result.data.document} owner={result.data.owner} allowDownload={result.data.allowDownload} />
      ) : result.state === "locked" ? (
        <ShareUnlockForm unlockUrl={`/api/share/${encodeURIComponent(token)}/unlock`} />
      ) : (
        <PublicUnavailable locale={locale} />
      )}
    </PublicShell>
  );
}
