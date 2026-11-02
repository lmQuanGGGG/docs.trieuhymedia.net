import { StarredView } from "@/components/documents/preset-views";
import { initPage, navMetadata } from "@/i18n/page";

export const generateMetadata = ({ params }: PageProps<"/[locale]/starred">) => navMetadata(params, "starred");

export default async function StarredPage({ params }: PageProps<"/[locale]/starred">) {
  await initPage(params);
  return <StarredView />;
}
