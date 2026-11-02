"use client";

import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { SettingsCard } from "./settings-card";

const options = [
  { value: "light", icon: Sun },
  { value: "dark", icon: Moon },
  { value: "system", icon: Monitor },
] as const;

const subscribe = () => () => {};

function Preview({ dark }: { dark: boolean }) {
  return (
    <span className={cn("flex h-20 w-full gap-1.5 overflow-hidden rounded-lg p-1.5", dark ? "bg-[#111214]" : "bg-[#F8F9FA]")}>
      <span className={cn("w-1/4 rounded-md", dark ? "bg-[#151618]" : "bg-white")} />
      <span className="flex flex-1 flex-col gap-1.5">
        <span className={cn("h-3 w-3/5 rounded", dark ? "bg-[#2B2D31]" : "bg-[#E9EAEC]")} />
        <span className={cn("flex-1 rounded-md shadow-sm", dark ? "bg-[#1C1D20]" : "bg-white")}>
          <span className={cn("m-1.5 block h-2 w-1/3 rounded", "bg-[#4CAF50]")} />
        </span>
      </span>
    </span>
  );
}

export function AppearanceSection() {
  const t = useTranslations("theme");
  const ts = useTranslations("settings.appearance");
  const { theme, setTheme } = useTheme();
  // Chỉ biết theme thật sau khi mount (lưu ở localStorage)
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  return (
    <SettingsCard title={ts("title")} description={ts("description")}>
      <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label={ts("title")}>
        {options.map((o) => {
          const selected = mounted && theme === o.value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setTheme(o.value)}
              className={cn(
                "relative grid gap-3 rounded-xl bg-muted/50 p-3 text-left transition-all hover:bg-muted",
                selected && "bg-card shadow-lift ring-2 ring-brand/50",
              )}
            >
              {o.value === "system" ? (
                <span className="grid grid-cols-2 gap-1 overflow-hidden rounded-lg">
                  <Preview dark={false} />
                  <Preview dark />
                </span>
              ) : (
                <Preview dark={o.value === "dark"} />
              )}
              <span className="flex items-start gap-2">
                <o.icon className="mt-0.5 size-4 text-muted-foreground" />
                <span>
                  <span className="block text-sm font-medium">{t(o.value)}</span>
                  <span className="block text-xs text-muted-foreground">{t(`${o.value}Description`)}</span>
                </span>
              </span>
              {selected ? (
                <span className="absolute top-2 right-2 grid size-5 place-items-center rounded-full bg-brand text-primary-foreground">
                  <Check className="size-3" />
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </SettingsCard>
  );
}
