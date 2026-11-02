"use client";

import { Globe2, Lock, UsersRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { DocumentStatus, Visibility } from "@/types";

const statusStyles: Record<DocumentStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  review: "bg-warning/12 text-warning",
  approved: "bg-success/12 text-success",
  archived: "bg-muted text-muted-foreground/80",
};

export function StatusBadge({ status, className }: { status: DocumentStatus; className?: string }) {
  const t = useTranslations("statuses");
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full px-2.5 text-xs font-medium whitespace-nowrap",
        statusStyles[status],
        className,
      )}
    >
      {t(status)}
    </span>
  );
}

const visibilityIcon = { private: Lock, team: UsersRound, public: Globe2 } as const;

export function VisibilityLabel({ visibility, className }: { visibility: Visibility; className?: string }) {
  const t = useTranslations("visibility");
  const Icon = visibilityIcon[visibility];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm text-muted-foreground whitespace-nowrap", className)}>
      <Icon className={cn("size-3.5", visibility === "public" && "text-brand")} />
      {t(visibility)}
    </span>
  );
}
