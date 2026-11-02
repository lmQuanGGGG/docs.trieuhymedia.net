"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PASSWORD_MIN } from "@/components/auth/change-password-form";
import { FormField } from "@/components/shared/form-field";
import { useWorkspace } from "@/lib/store/workspace-store";
import { useApiErrorToast } from "@/lib/use-api-error";
import { type Role, roles } from "@/types";
import { generateTempPassword, TempPasswordField } from "./temp-password-field";

/** Admin tạo tài khoản nhân viên kèm mật khẩu tạm (chưa có email mời tự động) */
export function InviteDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const t = useTranslations();
  const tv = useTranslations("validation");
  const { createMember, members, currentUser } = useWorkspace();
  const showError = useApiErrorToast();
  // Chỉ Super Admin được tạo Super Admin
  const assignable = roles.filter((r) => r !== "superAdmin" || currentUser?.role === "superAdmin");

  const schema = z.object({
    name: z.string().trim().min(2, tv("nameMin", { min: 2 })),
    title: z.string().trim().max(80),
    email: z
      .email(tv("email"))
      .refine((e) => !members.some((m) => m.email.toLowerCase() === e.toLowerCase()), t("errors.conflict")),
    role: z.enum(roles),
    password: z.string().min(PASSWORD_MIN, tv("passwordMin", { min: PASSWORD_MIN })),
  });

  const fresh = () => ({ name: "", title: "", email: "", role: "viewer" as Role, password: generateTempPassword() });
  const { register, control, handleSubmit, reset, formState } = useForm({ resolver: zodResolver(schema), defaultValues: fresh() });

  const onSubmit = handleSubmit(async (v) => {
    try {
      await createMember(v);
      toast.success(t("team.created", { email: v.email }), { duration: 8000 });
      reset(fresh());
      onOpenChange(false);
    } catch (error) {
      showError(error);
    }
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset(fresh());
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("team.createTitle")}</DialogTitle>
          <DialogDescription>{t("team.createDescription")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4" noValidate>
          <FormField id="member-name" label={t("team.nameLabel")} error={formState.errors.name?.message}>
            <Input id="member-name" aria-invalid={!!formState.errors.name} {...register("name")} />
          </FormField>
          <FormField id="member-title" label={t("team.titleLabel")} error={formState.errors.title?.message}>
            <Input id="member-title" {...register("title")} />
          </FormField>
          <FormField id="member-email" label={t("team.emailLabel")} error={formState.errors.email?.message}>
            <Input
              id="member-email"
              type="email"
              inputMode="email"
              autoComplete="off"
              placeholder={t("team.emailPlaceholder")}
              aria-invalid={!!formState.errors.email}
              {...register("email")}
            />
          </FormField>
          <Controller
            control={control}
            name="role"
            render={({ field }) => (
              <FormField id="member-role" label={t("team.roleLabel")} hint={t(`roles.${field.value}Description`)}>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="member-role" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {assignable.map((r) => (
                      <SelectItem key={r} value={r}>
                        {t(`roles.${r}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field, fieldState }) => (
              <FormField id="member-password" label={t("team.tempPassword")} error={fieldState.error?.message}>
                <TempPasswordField id="member-password" value={field.value} onChange={field.onChange} invalid={!!fieldState.error} />
              </FormField>
            )}
          />
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={formState.isSubmitting}>{t("team.submitCreate")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
