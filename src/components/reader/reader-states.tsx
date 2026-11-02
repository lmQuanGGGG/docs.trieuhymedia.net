"use client";

import { ExternalLink, FileWarning } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function ReaderError({ url }: { url?: string }) {
  const t = useTranslations("reader");
  return (
    <div className="grid justify-items-center gap-3 rounded-2xl bg-muted/50 px-6 py-16 text-center">
      <FileWarning className="size-6 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{t("error")}</p>
      {url ? (
        <Button asChild variant="secondary" size="sm">
          <a href={url} target="_blank" rel="noopener noreferrer">
            <ExternalLink /> {t("openInNewTab")}
          </a>
        </Button>
      ) : null}
    </div>
  );
}
