"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Logo, LogoMark } from "@/components/shared/logo";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { SidebarNav } from "./sidebar-nav";

/**
 * Sidebar desktop/tablet. Tablet (md → lg) luôn ở dạng rail icon;
 * desktop (≥ lg) cho phép người dùng thu gọn.
 */
export function AppSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const t = useTranslations();

  return (
    <aside
      className={cn(
        "glass sticky top-0 z-30 hidden h-dvh shrink-0 flex-col shadow-[1px_0_0_var(--sidebar-border)] md:flex",
        "w-[68px] transition-[width] duration-200 ease-out",
        !collapsed && "lg:w-64",
      )}
    >
      <div className={cn("flex h-14 items-center px-4", collapsed ? "justify-center px-0" : "lg:justify-between")}>
        <Link href="/" className="flex min-w-0 items-center rounded-lg" aria-label={t("common.appName")}>
          <span className={cn("hidden", !collapsed && "lg:flex")}>
            <Logo />
          </span>
          <span className={cn(!collapsed && "lg:hidden")}>
            <LogoMark />
          </span>
        </Link>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        {/* Tablet: luôn rail */}
        <div className="lg:hidden">
          <SidebarNav collapsed />
        </div>
        <div className="hidden lg:block">
          <SidebarNav collapsed={collapsed} />
        </div>
      </ScrollArea>

      <div className={cn("hidden p-2.5 lg:flex", collapsed ? "justify-center" : "justify-end")}>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggle}
          aria-label={collapsed ? t("nav.expand") : t("nav.collapse")}
          className="text-muted-foreground"
        >
          {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
        </Button>
      </div>
    </aside>
  );
}
