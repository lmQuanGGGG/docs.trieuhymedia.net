"use client";

import { Loader2, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { type Locale, localeLabels, locales } from "@/i18n/routing";
import { formatBytes } from "@/lib/format";
import { useWorkspace } from "@/lib/store/workspace-store";
import { useApiErrorToast } from "@/lib/use-api-error";
import type { DocumentItem } from "@/types";

const ACCEPT = ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,image/*";

/** Quản lý bản dịch theo ngôn ngữ của một tài liệu */
export function VariantsPanel({ document: doc }: { document: DocumentItem }) {
  const t = useTranslations("detail");
  const uiLocale = useLocale();
  const { uploadVariant, deleteVariant } = useWorkspace();
  const showError = useApiErrorToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [target, setTarget] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const canEdit = !!doc.can?.edit;
  const label = (l: string) => localeLabels[l as Locale] ?? l;

  const pick = (locale: string) => {
    setTarget(locale);
    inputRef.current?.click();
  };

  const onFile = async (file: File | undefined) => {
    if (!file || !target) return;
    setBusy(target);
    try {
      await uploadVariant(doc.id, target, file);
      toast.success(t("variantUploaded", { lang: label(target) }));
    } catch (error) {
      showError(error);
    } finally {
      setBusy(null);
      setTarget(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = async (locale: string) => {
    setBusy(locale);
    try {
      await deleteVariant(doc.id, locale);
      toast.success(t("variantRemoved", { lang: label(locale) }));
    } catch (error) {
      showError(error);
    } finally {
      setBusy(null);
    }
  };

  if (!canEdit && doc.variants.length === 0) return null;

  return (
    <section className="surface p-5">
      <h2 className="text-sm font-semibold">{t("variants")}</h2>
      <p className="mt-1 mb-3 text-xs text-muted-foreground">{t("variantsHint")}</p>
      <ul className="grid gap-1">
        {locales.map((l) => {
          const isOriginal = l === doc.locale;
          const v = doc.variants.find((x) => x.locale === l);
          return (
            <li key={l} className="flex items-center gap-2 py-1.5 text-sm" lang={l}>
              <span className="min-w-0 flex-1">
                <span className="font-medium">{label(l)}</span>
                <span className="ml-1.5 text-xs text-muted-foreground">
                  {isOriginal ? t("originalFile") : v ? formatBytes(v.sizeBytes, uiLocale) : t("noVariant")}
                </span>
              </span>
              {canEdit && !isOriginal ? (
                busy === l ? (
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                ) : v ? (
                  <span className="flex gap-0.5">
                    <Button variant="ghost" size="icon-sm" onClick={() => pick(l)} aria-label={t("replaceVariant", { lang: label(l) })}>
                      <RefreshCw />
                    </Button>
                    <Button variant="ghost" size="icon-sm" className="text-destructive" onClick={() => void remove(l)} aria-label={t("removeVariant", { lang: label(l) })}>
                      <Trash2 />
                    </Button>
                  </span>
                ) : (
                  <Button variant="ghost" size="sm" className="text-brand" onClick={() => pick(l)}>
                    <Plus /> {t("addVariant")}
                  </Button>
                )
              ) : null}
            </li>
          );
        })}
      </ul>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => void onFile(e.target.files?.[0])}
      />
    </section>
  );
}
