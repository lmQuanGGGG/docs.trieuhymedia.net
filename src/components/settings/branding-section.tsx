"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Logo } from "@/components/shared/logo";
import { company } from "@/config/company";
import { cn } from "@/lib/utils";
import { SettingsCard } from "./settings-card";

const accents = ["#4CAF50", "#9B4148", "#B4536A", "#3F6E6A", "#B7791F", "#52525B"];

export function BrandingSection() {
  const t = useTranslations();
  const [accent, setAccent] = useState(accents[0]);
  const [footer, setFooter] = useState(`${company.legalName}\n${company.address}`);

  return (
    <SettingsCard
      title={t("settings.branding.title")}
      description={t("settings.branding.description")}
      footer={<Button onClick={() => toast.info(t("settings.notPersisted"))}>{t("common.saveChanges")}</Button>}
    >
      <div className="grid grid-cols-1 gap-6">
        <div className="grid gap-2">
          <span className="text-[13px] font-medium">{t("settings.branding.accent")}</span>
          <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label={t("settings.branding.accent")}>
            {accents.map((c) => (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={accent === c}
                aria-label={c}
                onClick={() => setAccent(c)}
                style={{ backgroundColor: c }}
                className={cn(
                  "grid size-9 place-items-center rounded-full transition-transform hover:scale-105",
                  accent === c && "ring-2 ring-offset-2 ring-offset-card",
                )}
              >
                {accent === c ? <Check className="size-4 text-white" /> : null}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">{t("settings.branding.accentHint")}</p>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="brand-footer" className="text-[13px]">{t("settings.branding.footer")}</Label>
          <Textarea id="brand-footer" rows={3} value={footer} onChange={(e) => setFooter(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <span className="text-[13px] font-medium">{t("settings.branding.preview")}</span>
          <div className="overflow-hidden rounded-xl bg-muted/50">
            <div className="flex items-center justify-between gap-3 p-4">
              <Logo />
              <span className="rounded-lg px-3 py-1.5 text-xs font-medium text-white" style={{ backgroundColor: accent }}>
                {t("publicShare.download")}
              </span>
            </div>
            <p className="px-4 pb-4 text-xs whitespace-pre-line text-muted-foreground">{footer}</p>
          </div>
        </div>
      </div>
    </SettingsCard>
  );
}
