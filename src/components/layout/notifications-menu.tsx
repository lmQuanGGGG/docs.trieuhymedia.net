"use client";

import { Bell } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MemberAvatar } from "@/components/shared/member-avatar";
import { useWorkspace } from "@/lib/store/workspace-store";
import { cn } from "@/lib/utils";

export function NotificationsMenu() {
  const t = useTranslations();
  const format = useFormatter();
  const { notifications, getMember, markAllRead } = useWorkspace();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t("header.notifications")} className="relative text-muted-foreground">
          <Bell className="size-4" />
          {unread > 0 ? (
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-brand ring-2 ring-background" />
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(92vw,360px)] p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm font-semibold">{t("header.notifications")}</span>
          {unread > 0 ? (
            <Button variant="ghost" size="xs" onClick={markAllRead} className="text-brand">
              {t("header.markAllRead")}
            </Button>
          ) : null}
        </div>
        <div className="h-px bg-border" />
        <ul className="max-h-80 overflow-y-auto py-1.5">
          {notifications.map((n) => {
            const actor = getMember(n.actorId);
            return (
              <li key={n.id} className="flex gap-3 px-4 py-2.5">
                <MemberAvatar member={actor} />
                <div className="min-w-0 flex-1 text-sm">
                  <p className="text-pretty">
                    <span className="font-medium">{actor?.name}</span>{" "}
                    <span className="text-muted-foreground">{t(`activity.verbs.${n.action}`)}</span>{" "}
                    <span className="font-medium">{n.targetName}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {format.dateTime(new Date(n.createdAt), { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>
                <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", n.read ? "bg-transparent" : "bg-brand")} />
              </li>
            );
          })}
        </ul>
        {unread === 0 ? (
          <p className="px-4 pb-3 text-xs text-muted-foreground">{t("header.noNotifications")}</p>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
