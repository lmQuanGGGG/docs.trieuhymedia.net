"use client";

import { Download } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { createContext, type ReactNode, useContext, useState } from "react";
import { Button } from "@/components/ui/button";
import { DocumentReader } from "@/components/reader/document-reader";
import { LanguageSwitch } from "@/components/reader/language-switch";
import { availableLocales, defaultLocaleFor, documentForLocale } from "@/lib/doc-url";
import { downloadHref } from "@/lib/download";
import type { DocumentItem } from "@/types";

interface PublicDocState {
  original: DocumentItem;
  view: DocumentItem;
  lang: string;
  setLang: (lang: string) => void;
}

const PublicDocContext = createContext<PublicDocState | null>(null);

/** Giữ ngôn ngữ đang xem chung cho nút tải và trình đọc trên trang chia sẻ */
export function PublicDocumentProvider({ document: doc, children }: { document: DocumentItem; children: ReactNode }) {
  const uiLocale = useLocale();
  const [lang, setLang] = useState(() => defaultLocaleFor(doc, uiLocale));
  return (
    <PublicDocContext.Provider value={{ original: doc, view: documentForLocale(doc, lang), lang, setLang }}>
      {children}
    </PublicDocContext.Provider>
  );
}

function usePublicDoc(): PublicDocState {
  const ctx = useContext(PublicDocContext);
  if (!ctx) throw new Error("Cần PublicDocumentProvider");
  return ctx;
}

export function PublicDownloadButton({ allowed }: { allowed: boolean }) {
  const t = useTranslations("publicShare");
  const { view } = usePublicDoc();
  if (!allowed || !view.fileUrl) {
    return <p className="text-sm text-muted-foreground">{t("downloadDisabled")}</p>;
  }
  return (
    <Button size="lg" asChild>
      <a href={downloadHref(view.fileUrl)}>
        <Download /> {t("download")}
      </a>
    </Button>
  );
}

export function PublicPreview({ allowDownload }: { allowDownload: boolean }) {
  const { original, view, lang, setLang } = usePublicDoc();
  return (
    <>
      <LanguageSwitch locales={availableLocales(original)} original={original.locale} value={lang} onChange={setLang} />
      <DocumentReader
        key={lang}
        document={view}
        onDownload={allowDownload && view.fileUrl ? () => window.location.assign(downloadHref(view.fileUrl as string)) : undefined}
      />
    </>
  );
}
