import { TeamView } from "@/components/team/team-view";
import { initPage, navMetadata } from "@/i18n/page";

export const generateMetadata = ({ params }: PageProps<"/[locale]/team">) => navMetadata(params, "team");

export default async function TeamPage({ params }: PageProps<"/[locale]/team">) {
  await initPage(params);
  return <TeamView />;
}
