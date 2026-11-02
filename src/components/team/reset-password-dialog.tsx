"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PASSWORD_MIN } from "@/components/auth/change-password-form";
import { FormField } from "@/components/shared/form-field";
import { useWorkspace } from "@/lib/store/workspace-store";
import { useApiErrorToast } from "@/lib/use-api-error";
import type { Member } from "@/types";
import { generateTempPassword, TempPasswordField } from "./temp-password-field";

export function ResetPasswordDialog({ member, onOpenChange }: { member: Member | null; onOpenChange: (open: boolean) => void }) {
  const t = useTranslations();
  const { resetPassword } = useWorkspace();
  const showError = useApiErrorToast();
  const [password, setPassword] = useState(generateTempPassword);
  const [pending, setPending] = useState(false);
  const tooShort = password.length < PASSWORD_MIN;

  const submit = async () => {
    if (!member || tooShort) return;
    setPending(true);
    try {
      await resetPassword(member.id, password);
      toast.success(t("team.resetDone", { name: member.name }));
      setPassword(generateTempPassword());
      onOpenChange(false);
    } catch (error) {
      showError(error);
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open={!!member} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("team.resetTitle", { name: member?.name ?? "" })}</DialogTitle>
          <DialogDescription>{t("team.resetDescription")}</DialogDescription>
        </DialogHeader>
        <FormField
          id="reset-password"
          label={t("team.tempPassword")}
          error={tooShort ? t("validation.passwordMin", { min: PASSWORD_MIN }) : undefined}
        >
          <TempPasswordField id="reset-password" value={password} onChange={setPassword} invalid={tooShort} />
        </FormField>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={submit} disabled={pending || tooShort}>{t("team.submitReset")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
