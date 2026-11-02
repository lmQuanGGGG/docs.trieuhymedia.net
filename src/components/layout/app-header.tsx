"use client";

import { AppBreadcrumbs } from "./app-breadcrumbs";
import { GlobalSearch } from "./global-search";
import { LocaleSwitcher } from "./locale-switcher";
import { MobileNav } from "./mobile-nav";
import { NotificationsMenu } from "./notifications-menu";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";

export function AppHeader() {
  return (
    <header className="glass sticky top-0 z-20 shadow-[0_1px_0_var(--border)]">
      <div className="flex h-14 items-center gap-2 px-3 sm:px-6">
        <MobileNav />
        <div className="hidden min-w-0 flex-1 md:flex lg:max-w-xs xl:max-w-sm">
          <AppBreadcrumbs />
        </div>
        <div className="flex min-w-0 flex-1 justify-center md:justify-end lg:justify-center">
          <GlobalSearch />
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <LocaleSwitcher />
          <ThemeToggle />
          <NotificationsMenu />
          <span className="ml-1.5">
            <UserMenu />
          </span>
        </div>
      </div>
    </header>
  );
}
