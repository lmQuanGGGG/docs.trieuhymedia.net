import { CollectionsView } from "@/components/collections/collections-view";
import { initPage, navMetadata } from "@/i18n/page";

export const generateMetadata = ({ params }: PageProps<"/[locale]/collections">) => navMetadata(params, "collections");

export default async function CollectionsPage({ params }: PageProps<"/[locale]/collections">) {
  await initPage(params);
  return <CollectionsView />;
}
