import { RecentView } from "@/components/documents/preset-views";
import { initPage, navMetadata } from "@/i18n/page";

export const generateMetadata = ({ params }: PageProps<"/[locale]/recent">) => navMetadata(params, "recent");

export default async function RecentPage({ params }: PageProps<"/[locale]/recent">) {
  await initPage(params);
  return <RecentView />;
}
