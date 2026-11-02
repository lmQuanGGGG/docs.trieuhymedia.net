import { SettingsView } from "@/components/settings/settings-view";
import { initPage, navMetadata } from "@/i18n/page";

export const generateMetadata = ({ params }: PageProps<"/[locale]/settings">) => navMetadata(params, "settings");

export default async function SettingsPage({ params }: PageProps<"/[locale]/settings">) {
  await initPage(params);
  return <SettingsView />;
}
