import type { ReactNode } from "react";

export function SettingsCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className="surface overflow-hidden">
      <div className="p-5 sm:p-6">
        <h2 className="text-base font-semibold">{title}</h2>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        <div className="mt-5">{children}</div>
      </div>
      {footer ? <div className="flex justify-end gap-2 bg-muted/50 px-5 py-3 sm:px-6">{footer}</div> : null}
    </section>
  );
}
