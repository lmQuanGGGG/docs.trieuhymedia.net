"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CloudUpload, Info, Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { type DragEvent, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { FormField } from "@/components/shared/form-field";
import { formatBytes } from "@/lib/format";
import { useWorkspace } from "@/lib/store/workspace-store";
import { useApiErrorToast } from "@/lib/use-api-error";
import { cn } from "@/lib/utils";
import { FileTypeIcon } from "../file-type-icon";
import { inferTypeFromFile } from "./file-type";
import { MetaSelectFields } from "./meta-fields";
import { uploadSchema } from "./schemas";

const ACCEPT = ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,image/*,video/mp4,video/quicktime,video/webm,.mp4,.mov,.m4v,.webm";

export function UploadDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const t = useTranslations();
  const tv = useTranslations("validation");
  const locale = useLocale();
  const { uploadDocument } = useWorkspace();
  const [progress, setProgress] = useState<number | null>(null);
  const showError = useApiErrorToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const form = useForm({
    resolver: zodResolver(uploadSchema(tv)),
    defaultValues: {
      title: "",
      category: "proposals",
      brand: "Triệu Hỷ Media",
      visibility: "team",
      file: null,
    },
  });
  const { register, control, handleSubmit, setValue, reset, formState } = form;
  const file = useWatch({ control, name: "file" });

  const pickFile = (f: File | undefined) => {
    if (!f) return;
    setValue("file", f, { shouldValidate: true });
    if (!form.getValues("title")) {
      setValue("title", f.name.replace(/\.[^.]+$/, ""), { shouldValidate: true });
    }
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    pickFile(e.dataTransfer.files[0]);
  };

  const onSubmit = handleSubmit(async (values) => {
    setProgress(0);
    try {
      const doc = await uploadDocument(
        values.file,
        { title: values.title, category: values.category, brand: values.brand, visibility: values.visibility },
        setProgress,
      );
      toast.success(t("documents.toast.uploaded", { title: doc.title }));
      reset();
      onOpenChange(false);
    } catch (error) {
      showError(error);
    } finally {
      setProgress(null);
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
          <DialogTitle>{t("dialogs.upload.title")}</DialogTitle>
          <DialogDescription>{t("dialogs.upload.description")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4" noValidate>
          <Controller
            control={control}
            name="file"
            render={({ fieldState }) => (
              <div className="grid gap-1.5">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 rounded-xl bg-muted/60 px-4 py-7 text-center transition-colors",
                    "outline-2 outline-dashed outline-offset-[-2px] outline-border hover:bg-muted",
                    dragging && "bg-brand-soft outline-brand",
                    fieldState.error && "outline-destructive/60",
                  )}
                >
                  {file ? (
                    <span className="flex max-w-full items-center gap-3 text-left">
                      <FileTypeIcon type={inferTypeFromFile(file)} />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{file.name}</span>
                        <span className="block text-xs text-muted-foreground">
                          {formatBytes(file.size, locale)} · {t("dialogs.upload.change")}
                        </span>
                      </span>
                    </span>
                  ) : (
                    <>
                      <CloudUpload className="size-6 text-brand" />
                      <span className="text-sm font-medium">
                        {t("dialogs.upload.dropzone")}{" "}
                        <span className="text-brand">{t("dialogs.upload.browse")}</span>
                      </span>
                      <span className="text-xs text-muted-foreground">{t("dialogs.upload.hint")}</span>
                    </>
                  )}
                </button>
                <input
                  ref={inputRef}
                  type="file"
                  accept={ACCEPT}
                  className="sr-only"
                  tabIndex={-1}
                  aria-label={t("dialogs.upload.file")}
                  onChange={(e) => pickFile(e.target.files?.[0])}
                />
                {fieldState.error ? (
                  <p role="alert" className="text-xs text-destructive">
                    {fieldState.error.message}
                  </p>
                ) : null}
              </div>
            )}
          />
          <FormField id="upload-title" label={t("dialogs.upload.titleLabel")} error={formState.errors.title?.message}>
            <Input id="upload-title" aria-invalid={!!formState.errors.title} {...register("title")} />
          </FormField>
          <MetaSelectFields control={control} idPrefix="upload" />
          <p className="flex gap-2 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
            <Info className="mt-0.5 size-3.5 shrink-0" />
            {t("dialogs.upload.notice")}
          </p>
          {progress !== null ? (
            <div className="grid gap-1.5" aria-live="polite">
              <Progress value={progress} />
              <p className="text-xs text-muted-foreground tabular-nums">{t("dialogs.upload.uploading", { percent: progress })}</p>
            </div>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={formState.isSubmitting}>
              {formState.isSubmitting ? <Loader2 className="animate-spin" /> : null}
              {t("dialogs.upload.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
