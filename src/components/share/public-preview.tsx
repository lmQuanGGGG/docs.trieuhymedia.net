"use client";

import { Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { downloadHref } from "@/lib/download";
import { DocumentReader } from "@/components/reader/document-reader";
import type { DocumentItem } from "@/types";

export function PublicDownloadButton({ document: doc, allowed }: { document: DocumentItem; allowed: boolean }) {
  const t = useTranslations("publicShare");
  if (!allowed || !doc.fileUrl) {
    return <p className="text-sm text-muted-foreground">{t("downloadDisabled")}</p>;
  }
  return (
    <Button size="lg" asChild>
      <a href={downloadHref(doc.fileUrl)}>
        <Download /> {t("download")}
      </a>
    </Button>
  );
}

export function PublicPreview({ document: doc, allowDownload }: { document: DocumentItem; allowDownload: boolean }) {
  return (
    <DocumentReader
      document={doc}
      onDownload={allowDownload && doc.fileUrl ? () => window.location.assign(downloadHref(doc.fileUrl as string)) : undefined}
    />
  );
}
