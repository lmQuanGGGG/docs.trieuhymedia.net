import { SharedView } from "@/components/documents/preset-views";
import { initPage, navMetadata } from "@/i18n/page";

export const generateMetadata = ({ params }: PageProps<"/[locale]/shared">) => navMetadata(params, "shared");

export default async function SharedPage({ params }: PageProps<"/[locale]/shared">) {
  await initPage(params);
  return <SharedView />;
}
