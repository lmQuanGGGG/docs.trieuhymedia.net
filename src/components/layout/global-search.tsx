"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { FileTypeIcon } from "@/components/documents/file-type-icon";
import { categoryNav, managementNav, workspaceNav } from "@/config/navigation";
import { useRouter } from "@/i18n/navigation";
import { useWorkspace } from "@/lib/store/workspace-store";
import { cn } from "@/lib/utils";

export function GlobalSearch() {
  const t = useTranslations();
  const router = useRouter();
  const { documents } = useWorkspace();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = target?.closest("input, textarea, [contenteditable=true]");
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex h-9 w-full max-w-md items-center gap-2 rounded-xl bg-muted/70 px-3 text-sm text-muted-foreground transition-colors",
          "hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
        )}
        aria-label={t("header.search")}
      >
        <Search className="size-4 shrink-0" />
        <span className="flex-1 truncate text-left">
          <span className="hidden sm:inline">{t("header.search")}</span>
          <span className="sm:hidden">{t("header.searchShort")}</span>
        </span>
        <kbd className="hidden h-5 items-center rounded-md bg-background px-1.5 font-sans text-[11px] font-medium shadow-soft sm:inline-flex">
          ⌘K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen} title={t("header.searchShort")} description={t("header.search")}>
        <Command>
          <CommandInput placeholder={t("header.search")} />
          <CommandList>
            <CommandEmpty>{t("header.searchEmpty")}</CommandEmpty>
            <CommandGroup heading={t("header.searchDocuments")}>
              {documents.map((d) => (
                <CommandItem key={d.id} value={`${d.title} ${d.brand} ${d.id}`} onSelect={() => go(`/documents/${d.id}`)}>
                  <FileTypeIcon type={d.type} size="sm" />
                  <span className="truncate">{d.title}</span>
                  <span className="ml-auto shrink-0 text-xs text-muted-foreground">{d.brand}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading={t("header.searchPages")}>
              {[...workspaceNav, ...managementNav].map((item) => (
                <CommandItem key={item.href} value={`page ${t(`nav.${item.labelKey}`)}`} onSelect={() => go(item.href)}>
                  <item.icon />
                  {t(`nav.${item.labelKey}`)}
                </CommandItem>
              ))}
              {categoryNav.map((item) => (
                <CommandItem key={item.href} value={`category ${t(`categories.${item.slug}.name`)}`} onSelect={() => go(item.href)}>
                  <item.icon style={{ color: item.color }} />
                  {t(`categories.${item.slug}.name`)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
