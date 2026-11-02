"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-field";
import { api, ApiClientError } from "@/lib/api";

export const PASSWORD_MIN = 8;

export function ChangePasswordForm({ locale, firstLogin }: { locale: string; firstLogin: boolean }) {
  const t = useTranslations("account");
  const tv = useTranslations("validation");
  const [failed, setFailed] = useState<string | null>(null);
  const schema = z
    .object({
      currentPassword: z.string().min(1, tv("required")),
      newPassword: z.string().min(PASSWORD_MIN, tv("passwordMin", { min: PASSWORD_MIN })),
      confirm: z.string(),
    })
    .refine((v) => v.newPassword === v.confirm, { path: ["confirm"], message: t("mismatch") })
    .refine((v) => v.newPassword !== v.currentPassword, { path: ["newPassword"], message: t("samePassword") });

  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: "", newPassword: "", confirm: "" },
  });

  const onSubmit = handleSubmit(async ({ currentPassword, newPassword }) => {
    setFailed(null);
    try {
      await api.changePassword(currentPassword, newPassword);
      toast.success(t("success"));
      // Tải lại toàn trang để layout kiểm tra lại trạng thái tài khoản
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign(`/${locale}`);
    } catch (error) {
      const code = error instanceof ApiClientError ? error.code : "server_error";
      setFailed(code === "forbidden" ? t("wrongCurrent") : t("failed"));
    }
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-4" noValidate>
      <FormField id="pw-current" label={firstLogin ? t("tempPassword") : t("current")} error={formState.errors.currentPassword?.message}>
        <Input id="pw-current" type="password" autoComplete="current-password" autoFocus {...register("currentPassword")} />
      </FormField>
      <FormField id="pw-new" label={t("new")} error={formState.errors.newPassword?.message} hint={tv("passwordMin", { min: PASSWORD_MIN })}>
        <Input id="pw-new" type="password" autoComplete="new-password" {...register("newPassword")} />
      </FormField>
      <FormField id="pw-confirm" label={t("confirm")} error={formState.errors.confirm?.message}>
        <Input id="pw-confirm" type="password" autoComplete="new-password" {...register("confirm")} />
      </FormField>
      {failed ? <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{failed}</p> : null}
      <Button type="submit" size="lg" disabled={formState.isSubmitting} className="mt-1">
        {formState.isSubmitting ? <Loader2 className="animate-spin" /> : null}
        {t("submit")}
      </Button>
    </form>
  );
}
