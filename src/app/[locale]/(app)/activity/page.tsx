import { ActivityView } from "@/components/team/activity-view";
import { initPage, navMetadata } from "@/i18n/page";

export const generateMetadata = ({ params }: PageProps<"/[locale]/activity">) => navMetadata(params, "activity");

export default async function ActivityPage({ params }: PageProps<"/[locale]/activity">) {
  await initPage(params);
  return <ActivityView />;
}
