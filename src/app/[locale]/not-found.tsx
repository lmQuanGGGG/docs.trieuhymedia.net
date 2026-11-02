import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { IconTile } from "@/components/shared/icon-tile";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("notFound");
  return (
    <main className="grid min-h-dvh place-items-center bg-canvas px-4">
      <div className="surface grid max-w-md justify-items-center gap-4 p-10 text-center">
        <IconTile name="compass" size="lg" />
        <h1 className="text-xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
        <Button asChild>
          <Link href="/">{t("home")}</Link>
        </Button>
      </div>
    </main>
  );
}
