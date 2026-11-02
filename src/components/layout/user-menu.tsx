"use client";

import { KeyRound, LogOut, Settings, UserRound } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { api } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MemberAvatar } from "@/components/shared/member-avatar";
import { Link } from "@/i18n/navigation";
import { useWorkspace } from "@/lib/store/workspace-store";

export function UserMenu() {
  const t = useTranslations();
  const { currentUser } = useWorkspace();
  const locale = useLocale();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={currentUser?.name ?? t("header.profile")}
      >
        <MemberAvatar member={currentUser} size="sm" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="flex items-center gap-3 py-2">
          <MemberAvatar member={currentUser} size="md" />
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-foreground">{currentUser?.name}</span>
            <span className="block truncate text-xs font-normal text-muted-foreground">{currentUser?.email}</span>
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/team">
            <UserRound /> {t("header.profile")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account/password">
            <KeyRound /> {t("header.changePassword")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Settings /> {t("nav.settings")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={async () => {
            await api.logout().catch(() => undefined);
            // Tải lại toàn trang để xoá sạch dữ liệu phiên cũ khỏi bộ nhớ
            // eslint-disable-next-line @next/next/no-location-assign-relative-destination
            window.location.assign(`/${locale}/login`);
          }}
        >
          <LogOut /> {t("header.signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
