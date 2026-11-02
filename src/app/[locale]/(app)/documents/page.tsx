import { AllDocumentsView } from "@/components/documents/preset-views";
import { initPage, navMetadata } from "@/i18n/page";

export const generateMetadata = ({ params }: PageProps<"/[locale]/documents">) => navMetadata(params, "allDocuments");

export default async function DocumentsPage({ params }: PageProps<"/[locale]/documents">) {
  await initPage(params);
  return <AllDocumentsView />;
}
