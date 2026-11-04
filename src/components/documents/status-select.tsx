"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWorkspace } from "@/lib/store/workspace-store";
import { useApiErrorToast } from "@/lib/use-api-error";
import { type DocumentItem, type DocumentStatus, documentStatuses } from "@/types";
import { StatusBadge } from "./badges";

/** Người có quyền sửa đổi được trạng thái ngay tại panel; người khác chỉ thấy nhãn */
export function StatusSelect({ document }: { document: DocumentItem }) {
  const t = useTranslations();
  const { setStatus } = useWorkspace();
  const showError = useApiErrorToast();
  const [pending, setPending] = useState(false);

  if (!document.can?.edit) return <StatusBadge status={document.status} />;

  const change = async (value: string) => {
    const next = value as DocumentStatus;
    if (next === document.status) return;
    setPending(true);
    try {
      await setStatus(document.id, next);
      toast.success(t("detail.statusUpdated", { status: t(`statuses.${next}`) }));
    } catch (error) {
      showError(error);
    } finally {
      setPending(false);
    }
  };

  return (
    <Select value={document.status} onValueChange={change} disabled={pending}>
      <SelectTrigger size="sm" className="h-8 min-w-32 rounded-lg" aria-label={t("documents.columns.status")}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {documentStatuses.map((s) => (
          <SelectItem key={s} value={s}>
            <StatusBadge status={s} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
