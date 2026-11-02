"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { useWorkspace } from "@/lib/store/workspace-store";
import { useApiErrorToast } from "@/lib/use-api-error";

export function DeleteDialog({
  documentIds,
  onDone,
  onOpenChange,
}: {
  documentIds: string[] | undefined;
  onDone?: () => void;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations();
  const { remove } = useWorkspace();
  const showError = useApiErrorToast();
  const count = documentIds?.length ?? 0;

  return (
    <AlertDialog open={!!documentIds} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("dialogs.delete.title", { count })}</AlertDialogTitle>
          <AlertDialogDescription>{t("dialogs.delete.description")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            className={buttonVariants({ variant: "destructive" })}
            onClick={async () => {
              if (!documentIds) return;
              try {
                const deleted = await remove(documentIds);
                toast.success(t("documents.toast.deleted", { count: deleted }));
                onDone?.();
              } catch (error) {
                showError(error);
              }
            }}
          >
            {t("dialogs.delete.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
