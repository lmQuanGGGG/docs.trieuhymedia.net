"use client";

import { ShieldAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { type Visibility, visibilities } from "@/types";
import { SettingsCard } from "./settings-card";

const toggles = ["allowDownload", "linkExpiry", "guestDownload", "editorsShare"] as const;

export function SecuritySection() {
  const t = useTranslations();
  const [session, setSession] = useState("24h");
  const [visibility, setVisibility] = useState<Visibility>("team");
  const [flags, setFlags] = useState<Record<(typeof toggles)[number], boolean>>({
    allowDownload: true,
    linkExpiry: false,
    guestDownload: false,
    editorsShare: true,
  });

  return (
    <SettingsCard
      title={t("settings.security.title")}
      description={t("settings.security.description")}
      footer={<Button onClick={() => toast.info(t("settings.notPersisted"))}>{t("common.saveChanges")}</Button>}
    >
      <div className="grid gap-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="sec-session" className="text-[13px]">{t("settings.security.session")}</Label>
            <Select value={session} onValueChange={setSession}>
              <SelectTrigger id="sec-session" className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="8h">{t("settings.security.session8h")}</SelectItem>
                <SelectItem value="24h">{t("settings.security.session24h")}</SelectItem>
                <SelectItem value="7d">{t("settings.security.session7d")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="sec-visibility" className="text-[13px]">{t("settings.security.defaultVisibility")}</Label>
            <Select value={visibility} onValueChange={(v) => setVisibility(v as Visibility)}>
              <SelectTrigger id="sec-visibility" className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {visibilities.map((v) => (
                  <SelectItem key={v} value={v}>{t(`visibility.${v}`)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid rounded-xl bg-muted/50 px-4">
          {toggles.map((key) => (
            <div key={key} className="flex items-center justify-between gap-4 py-3 shadow-[inset_0_-1px_0_var(--border)] last:shadow-none">
              <Label htmlFor={`sec-${key}`} className="font-normal">{t(`settings.security.${key}`)}</Label>
              <Switch id={`sec-${key}`} checked={flags[key]} onCheckedChange={(v) => setFlags((f) => ({ ...f, [key]: v }))} />
            </div>
          ))}
        </div>
        <p className="flex gap-2 rounded-xl bg-brand-soft px-4 py-3 text-sm">
          <ShieldAlert className="mt-0.5 size-4 shrink-0 text-brand" />
          {t("settings.security.backendNotice")}
        </p>
      </div>
    </SettingsCard>
  );
}
