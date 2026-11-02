"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-field";
import { useWorkspace } from "@/lib/store/workspace-store";
import { useApiErrorToast } from "@/lib/use-api-error";
import type { DocumentItem } from "@/types";
import { titleSchema } from "./schemas";

export function RenameDialog({
  document,
  onOpenChange,
}: {
  document: DocumentItem | undefined;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations();
  const tv = useTranslations("validation");
  const { rename } = useWorkspace();
  const showError = useApiErrorToast();
  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(z.object({ title: titleSchema(tv) })),
    values: { title: document?.title ?? "" },
  });

  const onSubmit = handleSubmit(async ({ title }) => {
    if (!document) return;
    try {
      await rename(document.id, title);
      toast.success(t("documents.toast.renamed", { title }));
      onOpenChange(false);
    } catch (error) {
      showError(error);
    }
  });

  return (
    <Dialog open={!!document} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("dialogs.rename.title")}</DialogTitle>
          <DialogDescription className="truncate">{document?.title}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4" noValidate>
          <FormField id="rename-title" label={t("dialogs.rename.label")} error={formState.errors.title?.message}>
            <Input id="rename-title" autoFocus aria-invalid={!!formState.errors.title} {...register("title")} />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={formState.isSubmitting}>{t("dialogs.rename.submit")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
