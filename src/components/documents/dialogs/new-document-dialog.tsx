"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-field";
import { useRouter } from "@/i18n/navigation";
import { useWorkspace } from "@/lib/store/workspace-store";
import { useApiErrorToast } from "@/lib/use-api-error";
import { cn } from "@/lib/utils";
import { type Brand, type CategorySlug, type DocumentType, documentTypes, type Visibility } from "@/types";
import { FileTypeIcon } from "../file-type-icon";
import { MetaSelectFields } from "./meta-fields";
import { newDocumentSchema } from "./schemas";

export function NewDocumentDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const t = useTranslations();
  const tv = useTranslations("validation");
  const router = useRouter();
  const { createDocument } = useWorkspace();
  const showError = useApiErrorToast();

  const { register, control, handleSubmit, reset, formState } = useForm({
    resolver: zodResolver(newDocumentSchema(tv)),
    defaultValues: {
      title: "",
      type: "docx" as DocumentType,
      url: "",
      category: "proposals" as CategorySlug,
      brand: "Triệu Hỷ Media" as Brand,
      visibility: "private" as Visibility,
    },
  });
  const type = useWatch({ control, name: "type" });

  const onSubmit = handleSubmit(async (values) => {
    const form = new FormData();
    form.set("title", values.title);
    form.set("type", values.type);
    form.set("category", values.category);
    form.set("brand", values.brand);
    form.set("visibility", values.visibility);
    if (values.type === "link") form.set("url", values.url);
    try {
      const doc = await createDocument(form);
      toast.success(t("documents.toast.created", { title: doc.title }));
      reset();
      onOpenChange(false);
      router.push(`/documents/${doc.id}`);
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("dialogs.newDocument.title")}</DialogTitle>
          <DialogDescription>{t("dialogs.newDocument.description")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4" noValidate>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <fieldset className="grid gap-1.5">
                <legend className="mb-1.5 text-[13px] font-medium">{t("dialogs.newDocument.typeLabel")}</legend>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6" role="radiogroup">
                  {documentTypes.filter((dt) => dt !== "video").map((dt) => (
                    <button
                      key={dt}
                      type="button"
                      role="radio"
                      aria-checked={field.value === dt}
                      onClick={() => field.onChange(dt)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 rounded-xl px-1 py-2.5 text-[11px] font-medium text-muted-foreground transition-all",
                        "bg-muted/50 hover:bg-muted",
                        field.value === dt && "bg-card text-foreground shadow-lift ring-1 ring-brand/40",
                      )}
                    >
                      <FileTypeIcon type={dt} size="sm" />
                      <span className="truncate">{t(`documentTypes.${dt}`)}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
            )}
          />
          <FormField id="new-title" label={t("dialogs.upload.titleLabel")} error={formState.errors.title?.message}>
            <Input id="new-title" aria-invalid={!!formState.errors.title} {...register("title")} />
          </FormField>
          {type === "link" ? (
            <FormField id="new-url" label={t("dialogs.newDocument.linkLabel")} error={formState.errors.url?.message}>
              <Input
                id="new-url"
                inputMode="url"
                placeholder={t("dialogs.newDocument.linkPlaceholder")}
                aria-invalid={!!formState.errors.url}
                {...register("url")}
              />
            </FormField>
          ) : null}
          <MetaSelectFields control={control} idPrefix="new" />
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={formState.isSubmitting}>{t("dialogs.newDocument.submit")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
