"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { useWorkspace } from "@/lib/store/workspace-store";

/** Hiện trạng thái lỗi kèm nút thử lại khi không tải được dữ liệu từ máy chủ */
export function WorkspaceGate({ children }: { children: ReactNode }) {
  const t = useTranslations("errors");
  const { status, refresh } = useWorkspace();
  if (status !== "error") return children;
  return (
    <div className="surface">
      <EmptyState
        icon="link-off"
        title={t("loadFailed")}
        description={t("network")}
        action={<Button onClick={() => void refresh()}>{t("retry")}</Button>}
      />
    </div>
  );
}
