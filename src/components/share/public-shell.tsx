import { Mail, MapPin, Phone } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { IconTile } from "@/components/shared/icon-tile";
import { Logo } from "@/components/shared/logo";
import { company } from "@/config/company";
import type { Locale } from "@/i18n/routing";

/** Khung trang công khai cho đối tác: header logo + chân trang thông tin công ty */
export async function PublicShell({ locale, children }: { locale: Locale; children: ReactNode }) {
  const t = await getTranslations({ locale });
  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="glass sticky top-0 z-20 shadow-[0_1px_0_var(--border)]">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <a href={company.website} target="_blank" rel="noopener noreferrer" className="min-w-0">
            <Logo />
          </a>
          <div className="flex items-center gap-0.5">
            <LocaleSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12">{children}</main>

      <footer className="shadow-[0_-1px_0_var(--border)]">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 text-sm text-muted-foreground sm:px-6 md:grid-cols-[1fr_auto] md:items-end">
          <div className="grid gap-3">
            <Logo subtitle={t("publicShare.footerTagline")} />
            <p className="font-medium text-foreground">{company.legalName}</p>
            <p className="flex items-start gap-2"><MapPin className="mt-0.5 size-4 shrink-0" />{company.address}</p>
            <p className="flex flex-wrap gap-x-5 gap-y-1">
              <a href={`tel:${company.phone.replaceAll(" ", "")}`} className="inline-flex items-center gap-2 hover:text-foreground"><Phone className="size-4" />{company.phone}</a>
              <a href={`mailto:${company.email}`} className="inline-flex items-center gap-2 hover:text-foreground"><Mail className="size-4" />{company.email}</a>
            </p>
          </div>
          <div className="grid gap-1 md:text-right">
            <p>{t("publicShare.taxId")}: {company.taxId}</p>
            <p>{t("publicShare.rights", { year: 2026 })}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export async function PublicUnavailable({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale });
  return (
    <div className="surface mx-auto grid max-w-lg justify-items-center gap-4 p-10 text-center">
      <IconTile name="link-off" size="lg" />
      <h1 className="text-lg font-semibold">{t("publicShare.notFoundTitle")}</h1>
      <p className="text-sm text-muted-foreground">{t("publicShare.notFoundDescription")}</p>
      <Button asChild variant="secondary">
        <a href={company.website}>{t("publicShare.goHome")}</a>
      </Button>
    </div>
  );
}
