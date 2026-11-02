import type { Metadata } from "next";
import { DocumentDetailView } from "@/components/documents/document-detail-view";
import { initPage } from "@/i18n/page";
import { getCurrentMember } from "@/server/auth/session";
import { db } from "@/server/db";
import { canView } from "@/server/permissions";

export async function generateMetadata({ params }: PageProps<"/[locale]/documents/[id]">): Promise<Metadata> {
  const { id } = await params;
  const me = await getCurrentMember();
  if (!me) return {};
  const doc = await db.document.findFirst({ where: { id, deletedAt: null }, include: { accesses: true } });
  // Chỉ lộ tiêu đề khi người xem có quyền
  return doc && canView(me, doc) ? { title: doc.title } : {};
}

export default async function DocumentDetailPage({ params }: PageProps<"/[locale]/documents/[id]">) {
  await initPage(params);
  const { id } = await params;
  return <DocumentDetailView id={id} />;
}
