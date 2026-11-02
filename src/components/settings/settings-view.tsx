"use client";

import { Building2, Languages, Palette, ShieldCheck, SunMoon, Users, type LucideIcon, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { Link } from "@/i18n/navigation";
import { useWorkspace } from "@/lib/store/workspace-store";
import { cn } from "@/lib/utils";
import { AppearanceSection } from "./appearance-section";
import { BrandingSection } from "./branding-section";
import { GeneralSection } from "./general-section";
import { LanguageSection } from "./language-section";
import { SecuritySection } from "./security-section";
import { SettingsCard } from "./settings-card";

const sections = [
  { key: "general", icon: Building2 },
  { key: "appearance", icon: SunMoon },
  { key: "language", icon: Languages },
  { key: "members", icon: Users },
  { key: "security", icon: ShieldCheck },
  { key: "branding", icon: Palette },
] as const satisfies ReadonlyArray<{ key: string; icon: LucideIcon }>;

type SectionKey = (typeof sections)[number]["key"];

function MembersSection() {
  const t = useTranslations("settings.members");
  const { members } = useWorkspace();
  return (
    <SettingsCard title={t("title")} description={t("description")}>
      <div className="flex flex-col gap-4 rounded-xl bg-muted/50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm">{t("summary", { count: members.length })}</p>
        <Button asChild variant="secondary">
          <Link href="/team">
            {t("manage")} <ArrowRight />
          </Link>
        </Button>
      </div>
    </SettingsCard>
  );
}

export function SettingsView() {
  const t = useTranslations("settings");
  const [active, setActive] = useState<SectionKey>("general");

  return (
    <div className="grid grid-cols-1 gap-6">
      <PageHeader title={t("title")} description={t("description")} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start">
        <nav
          aria-label={t("title")}
          className="-mx-4 flex gap-1 overflow-x-auto px-4 scrollbar-none sm:mx-0 sm:px-0 lg:sticky lg:top-20 lg:flex-col"
        >
          {sections.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setActive(s.key)}
              aria-current={active === s.key ? "page" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                active === s.key && "bg-card text-foreground shadow-soft",
              )}
            >
              <s.icon className={cn("size-4", active === s.key && "text-brand")} />
              {t(`sections.${s.key}`)}
            </button>
          ))}
        </nav>
        <div className="min-w-0">
          {active === "general" && <GeneralSection />}
          {active === "appearance" && <AppearanceSection />}
          {active === "language" && <LanguageSection />}
          {active === "members" && <MembersSection />}
          {active === "security" && <SecuritySection />}
          {active === "branding" && <BrandingSection />}
        </div>
      </div>
    </div>
  );
}
