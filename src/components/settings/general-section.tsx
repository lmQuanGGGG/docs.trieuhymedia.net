"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ImageUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/shared/form-field";
import { LogoMark } from "@/components/shared/logo";
import { company } from "@/config/company";
import { SettingsCard } from "./settings-card";

export function GeneralSection() {
  const t = useTranslations("settings");
  const tv = useTranslations("validation");
  const tc = useTranslations("common");
  const schema = z.object({
    workspaceName: z.string().trim().min(2, tv("nameMin", { min: 2 })),
    companyName: z.string().trim().min(2, tv("nameMin", { min: 2 })),
    companyInfo: z.string().trim().max(500, tv("titleMax", { max: 500 })),
    website: z.url(tv("url")),
  });
  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      workspaceName: "Triệu Hỷ Media",
      companyName: company.legalName,
      companyInfo: `${company.address}\nMST: ${company.taxId} · ${company.phone} · ${company.email}`,
      website: company.website,
    },
  });

  const onSubmit = handleSubmit(() => toast.info(t("notPersisted")));

  return (
    <form onSubmit={onSubmit} noValidate>
      <SettingsCard
        title={t("general.title")}
        description={t("general.description")}
        footer={<Button type="submit" disabled={!formState.isDirty}>{tc("saveChanges")}</Button>}
      >
        <div className="grid gap-5">
          <div className="flex items-center gap-4">
            <LogoMark className="size-14 rounded-2xl text-lg" />
            <div className="grid gap-1.5">
              <span className="text-sm font-medium">{t("general.logo")}</span>
              <span className="text-xs text-muted-foreground">{t("general.logoHint")}</span>
              <Button type="button" variant="secondary" size="sm" className="justify-self-start" onClick={() => toast.info(t("general.logoUnavailable"))}>
                <ImageUp /> {t("general.uploadLogo")}
              </Button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="ws-name" label={t("general.workspaceName")} error={formState.errors.workspaceName?.message}>
              <Input id="ws-name" {...register("workspaceName")} />
            </FormField>
            <FormField id="ws-website" label={t("general.website")} error={formState.errors.website?.message}>
              <Input id="ws-website" inputMode="url" {...register("website")} />
            </FormField>
            <FormField id="ws-company" label={t("general.companyName")} error={formState.errors.companyName?.message} className="sm:col-span-2">
              <Input id="ws-company" {...register("companyName")} />
            </FormField>
            <FormField id="ws-info" label={t("general.companyInfo")} error={formState.errors.companyInfo?.message} className="sm:col-span-2">
              <Textarea id="ws-info" rows={3} {...register("companyInfo")} />
            </FormField>
          </div>
        </div>
      </SettingsCard>
    </form>
  );
}
