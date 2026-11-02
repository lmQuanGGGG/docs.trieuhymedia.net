"use client";

import { useTranslations } from "next-intl";
import { useCallback } from "react";
import { toast } from "sonner";
import { ApiClientError } from "@/lib/api";

/** Hiện toast lỗi theo mã lỗi từ API, đã dịch theo ngôn ngữ hiện tại */
export function useApiErrorToast() {
  const t = useTranslations("errors");
  return useCallback(
    (error: unknown) => {
      const code = error instanceof ApiClientError ? error.code : "server_error";
      if (code === "unauthorized") return; // adapter đã chuyển về trang đăng nhập
      toast.error(t(code));
    },
    [t],
  );
}
