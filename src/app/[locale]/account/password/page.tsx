import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Logo } from "@/components/shared/logo";
import { Link } from "@/i18n/navigation";
import { initPage } from "@/i18n/page";
import { getCurrentMember } from "@/server/auth/session";

export async function generateMetadata({ params }: PageProps<"/[locale]/account/password">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as "vi", namespace: "account" });
  return { title: t("title"), robots: { index: false } };
}

export default async function ChangePasswordPage({ params }: PageProps<"/[locale]/account/password">) {
  const locale = await initPage(params);
  const me = await getCurrentMember();
  if (!me) redirect(`/${locale}/login`);
  const t = await getTranslations({ locale });
  const firstLogin = me.mustChangePassword;

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="flex h-14 items-center justify-between px-4 sm:px-6">
        <Logo subtitle={t("common.workspacePlan")} />
        <div className="flex items-center gap-0.5">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </header>
      <main className="grid flex-1 place-items-center px-4 pb-16">
        <div className="surface w-full max-w-sm p-6 sm:p-8">
          <h1 className="text-2xl font-semibold tracking-tight">{t("account.title")}</h1>
          <p className="mt-1.5 mb-6 text-sm text-muted-foreground">
            {firstLogin ? t("account.firstLogin", { name: me.name }) : t("account.description")}
          </p>
          <ChangePasswordForm locale={locale} firstLogin={firstLogin} />
          {!firstLogin ? (
            <Button asChild variant="ghost" size="sm" className="mt-4">
              <Link href="/">
                <ArrowLeft /> {t("nav.overview")}
              </Link>
            </Button>
          ) : null}
        </div>
      </main>
    </div>
  );
}
