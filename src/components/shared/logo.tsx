import { cn } from "@/lib/utils";

/** Monogram "TH" — dùng tạm cho đến khi có file logo chính thức */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative grid size-8 shrink-0 place-items-center rounded-[10px] text-[13px] font-semibold tracking-tight text-white",
        "bg-[#9B4148] dark:bg-[#B4606A]",
        className,
      )}
    >
      TH
    </span>
  );
}

export function Logo({ className, subtitle }: { className?: string; subtitle?: string }) {
  return (
    <span className={cn("flex min-w-0 items-center gap-2.5", className)}>
      <LogoMark />
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-sm font-semibold tracking-tight">TRIỆU HỶ MEDIA</span>
        {subtitle ? <span className="truncate text-xs text-muted-foreground">{subtitle}</span> : null}
      </span>
    </span>
  );
}
