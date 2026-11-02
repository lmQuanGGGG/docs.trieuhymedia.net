"use client";

import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { SITE_URL } from "@/config/site";
import { downloadHref } from "@/lib/download";
import { useDialogs } from "@/lib/store/dialogs-store";
import { useWorkspace } from "@/lib/store/workspace-store";
import { useApiErrorToast } from "@/lib/use-api-error";
import type { DocumentItem } from "@/types";

export function useDocumentActions() {
  const t = useTranslations("documents.toast");
  const locale = useLocale();
  const { setStar } = useWorkspace();
  const { open } = useDialogs();
  const showError = useApiErrorToast();

  return {
    async toggleStar(doc: DocumentItem) {
      try {
        await setStar([doc.id], !doc.starred);
        toast.success(doc.starred ? t("unstarred", { title: doc.title }) : t("starred", { title: doc.title }));
      } catch (error) {
        showError(error);
      }
    },
    rename(doc: DocumentItem) {
      open({ kind: "rename", documentId: doc.id });
    },
    share(doc: DocumentItem) {
      open({ kind: "share", documentId: doc.id });
    },
    remove(doc: DocumentItem, onDone?: () => void) {
      open({ kind: "delete", documentIds: [doc.id], onDone });
    },
    download(doc: DocumentItem) {
      if (doc.type === "link" && doc.externalUrl) {
        window.open(doc.externalUrl, "_blank", "noopener,noreferrer");
        return;
      }
      if (!doc.fileUrl) {
        toast.info(t("downloadUnavailable"));
        return;
      }
      const a = document.createElement("a");
      a.href = downloadHref(doc.fileUrl);
      a.click();
    },
    async copyLink(doc: DocumentItem) {
      const url = `${SITE_URL}/${locale}/documents/${doc.id}`;
      try {
        await navigator.clipboard.writeText(url);
        toast.success(t("linkCopied"));
      } catch {
        toast.info(url);
      }
    },
  };
}
