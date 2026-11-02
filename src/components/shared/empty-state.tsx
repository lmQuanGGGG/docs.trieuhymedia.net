import type { Icon3DName } from "@/components/icons3d";
import type { ReactNode } from "react";
import { IconTile } from "./icon-tile";

export function EmptyState({
  icon,
  title,
  description,
  action,
  color,
}: {
  icon: Icon3DName;
  title: string;
  description?: string;
  action?: ReactNode;
  color?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <IconTile name={icon} color={color} size="lg" />
      <h3 className="mt-5 text-base font-semibold">{title}</h3>
      {description ? <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
