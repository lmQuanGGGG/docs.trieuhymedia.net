import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Logo } from "@/components/shared/logo";
import { company } from "@/config/company";
import { initPage } from "@/i18n/page";
import { getCurrentMember } from "@/server/auth/session";

export async function generateMetadata({ params }: PageProps<"/[locale]/login">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as "vi", namespace: "login" });
  return { title: t("title"), robots: { index: false } };
}

export default async function LoginPage({ params, searchParams }: PageProps<"/[locale]/login">) {
  const locale = await initPage(params);
  const { next } = await searchParams;
  if (await getCurrentMember()) redirect(`/${locale}`);
  const t = await getTranslations({ locale });

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
          <p className="text-xs font-medium tracking-wider text-brand uppercase">{t("login.welcome")}</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">{t("login.title")}</h1>
          <p className="mt-1.5 mb-6 text-sm text-muted-foreground">{t("login.subtitle")}</p>
          <LoginForm locale={locale} next={typeof next === "string" ? next : undefined} />
        </div>
      </main>
      <footer className="px-4 pb-6 text-center text-xs text-muted-foreground">{company.legalName}</footer>
    </div>
  );
}
