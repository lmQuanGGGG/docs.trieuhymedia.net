"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-field";
import { api, ApiClientError } from "@/lib/api";

/** Chỉ cho phép quay về đường dẫn nội bộ, tránh open redirect */
function safeNext(next: string | undefined, locale: string): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return `/${locale}`;
  return `/${locale}${next}`;
}

export function LoginForm({ locale, next }: { locale: string; next?: string }) {
  const t = useTranslations();
  const tv = useTranslations("validation");
  const [failed, setFailed] = useState<string | null>(null);
  const schema = z.object({ email: z.email(tv("email")), password: z.string().min(1, tv("required")) });
  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setFailed(null);
    try {
      await api.login(email, password);
      // Tải lại toàn trang để proxy và server thấy cookie phiên mới
      window.location.assign(safeNext(next, locale));
    } catch (error) {
      const code = error instanceof ApiClientError ? error.code : "server_error";
      setFailed(code === "unauthorized" || code === "bad_request" ? t("login.invalid") : t(`errors.${code}`));
    }
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-4" noValidate>
      <FormField id="login-email" label={t("login.email")} error={formState.errors.email?.message}>
        <Input id="login-email" type="email" autoComplete="username" inputMode="email" autoFocus aria-invalid={!!formState.errors.email} {...register("email")} />
      </FormField>
      <FormField id="login-password" label={t("login.password")} error={formState.errors.password?.message}>
        <Input id="login-password" type="password" autoComplete="current-password" aria-invalid={!!formState.errors.password} {...register("password")} />
      </FormField>
      {failed ? (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {failed}
        </p>
      ) : null}
      <Button type="submit" size="lg" disabled={formState.isSubmitting} className="mt-1">
        {formState.isSubmitting ? <Loader2 className="animate-spin" /> : null}
        {t("login.submit")}
      </Button>
    </form>
  );
}
