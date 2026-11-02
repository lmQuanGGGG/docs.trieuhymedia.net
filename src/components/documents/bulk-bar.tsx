"use client";

import { Star, Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useDialogs } from "@/lib/store/dialogs-store";
import { useWorkspace } from "@/lib/store/workspace-store";
import { useApiErrorToast } from "@/lib/use-api-error";

/** Thanh thao tác hàng loạt nổi ở đáy màn hình, kiểu glass */
export function BulkBar({ ids, onClear }: { ids: string[]; onClear: () => void }) {
  const t = useTranslations();
  const { setStar, getDocument } = useWorkspace();
  const showError = useApiErrorToast();
  const canDeleteAll = ids.every((id) => getDocument(id)?.can?.delete);
  const { open } = useDialogs();
  if (ids.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 animate-in fade-in-0 slide-in-from-bottom-4">
      <div className="glass pointer-events-auto flex items-center gap-1 rounded-2xl p-1.5 pl-4 shadow-float">
        <span className="mr-2 text-sm font-medium whitespace-nowrap">{t("common.selectedCount", { count: ids.length })}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            try {
              await setStar(ids, true);
              toast.success(t("documents.toast.bulkStarred", { count: ids.length }));
            } catch (error) {
              showError(error);
            }
          }}
        >
          <Star /> <span className="hidden sm:inline">{t("documents.bulk.star")}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={!canDeleteAll}
          className="text-destructive hover:text-destructive"
          onClick={() => open({ kind: "delete", documentIds: ids, onDone: onClear })}
        >
          <Trash2 /> <span className="hidden sm:inline">{t("documents.bulk.delete")}</span>
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={onClear} aria-label={t("common.clear")}>
          <X />
        </Button>
      </div>
    </div>
  );
}
