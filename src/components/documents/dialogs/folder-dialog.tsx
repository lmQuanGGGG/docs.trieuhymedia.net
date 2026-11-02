"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/shared/form-field";
import { useWorkspace } from "@/lib/store/workspace-store";
import { useApiErrorToast } from "@/lib/use-api-error";
import { type Brand, brands } from "@/types";
import { folderSchema } from "./schemas";

export function FolderDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const t = useTranslations();
  const tv = useTranslations("validation");
  const { createFolder } = useWorkspace();
  const showError = useApiErrorToast();
  const { register, control, handleSubmit, reset, formState } = useForm({
    resolver: zodResolver(folderSchema(tv)),
    defaultValues: { name: "", brand: "Triệu Hỷ Media" as Brand },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createFolder(values);
      toast.success(t("documents.toast.folderCreated", { name: values.name }));
      reset();
      onOpenChange(false);
    } catch (error) {
      showError(error);
    }
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("dialogs.folder.title")}</DialogTitle>
          <DialogDescription>{t("dialogs.folder.description")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4" noValidate>
          <FormField id="folder-name" label={t("dialogs.folder.nameLabel")} error={formState.errors.name?.message}>
            <Input
              id="folder-name"
              placeholder={t("dialogs.folder.namePlaceholder")}
              aria-invalid={!!formState.errors.name}
              {...register("name")}
            />
          </FormField>
          <Controller
            control={control}
            name="brand"
            render={({ field }) => (
              <FormField id="folder-brand" label={t("dialogs.folder.brandLabel")}>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="folder-brand" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            )}
          />
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={formState.isSubmitting}>{t("dialogs.folder.submit")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
