"use client";

import { useTranslations } from "next-intl";
import type { LucideIcon } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { categoryNav, isActivePath, managementNav, workspaceNav } from "@/config/navigation";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

interface ItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  collapsed: boolean;
  dotColor?: string;
  onNavigate?: () => void;
}

function NavLink({ href, label, icon: Icon, active, collapsed, dotColor, onNavigate }: ItemProps) {
  const link = (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group/nav relative flex h-8 items-center gap-2.5 rounded-lg px-2.5 text-[13px] font-medium text-muted-foreground transition-colors",
        "hover:bg-sidebar-accent hover:text-foreground",
        active && "bg-card text-foreground shadow-soft dark:bg-white/[0.06] dark:shadow-none",
        collapsed && "justify-center px-0",
      )}
    >
      {dotColor ? (
        <span
          style={{ "--dot": dotColor } as CSSProperties}
          className={cn(
            "grid size-4 shrink-0 place-items-center",
            "[&_svg]:size-4 [&_svg]:text-[var(--dot)]",
          )}
        >
          <Icon strokeWidth={1.9} />
        </span>
      ) : (
        <Icon
          strokeWidth={1.9}
          className={cn("size-4 shrink-0", active ? "text-brand" : "text-muted-foreground group-hover/nav:text-foreground")}
        />
      )}
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );

  if (!collapsed) return link;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

function Section({ title, collapsed, children }: { title: string; collapsed: boolean; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      {collapsed ? (
        <div className="mx-auto my-2 h-px w-6 bg-border" aria-hidden />
      ) : (
        <div className="px-2.5 pt-4 pb-1.5 text-[11px] font-medium tracking-wide text-muted-foreground/80 uppercase">
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

export function SidebarNav({ collapsed = false, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const t = useTranslations("nav");
  const tc = useTranslations("categories");
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 px-2.5 pb-4" aria-label={t("workspace")}>
      <Section title={t("workspace")} collapsed={collapsed}>
        {workspaceNav.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={t(item.labelKey)}
            icon={item.icon}
            active={isActivePath(pathname, item.href)}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}
      </Section>
      <Section title={t("categories")} collapsed={collapsed}>
        {categoryNav.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={tc(`${item.slug}.name`)}
            icon={item.icon}
            dotColor={item.color}
            active={isActivePath(pathname, item.href)}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}
      </Section>
      <Section title={t("management")} collapsed={collapsed}>
        {managementNav.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={t(item.labelKey)}
            icon={item.icon}
            active={isActivePath(pathname, item.href)}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}
      </Section>
    </nav>
  );
}
