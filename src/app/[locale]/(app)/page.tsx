import { OverviewView } from "@/components/dashboard/overview-view";
import { initPage, navMetadata } from "@/i18n/page";

export const generateMetadata = ({ params }: PageProps<"/[locale]">) => navMetadata(params, "overview");

export default async function OverviewPage({ params }: PageProps<"/[locale]">) {
  await initPage(params);
  return <OverviewView />;
}
