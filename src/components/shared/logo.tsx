import Image from "next/image";
import { cn } from "@/lib/utils";

const ALT = "TRIỆU HỶ MEDIA";

/** Biểu tượng tròn chữ 喜: dùng ở sidebar thu gọn và ô logo */
export function LogoMark({ className }: { className?: string }) {
  return (
    <Image
      src="/brand/logo-mark.png"
      alt={ALT}
      width={160}
      height={160}
      priority
      className={cn("size-8 shrink-0 object-contain", className)}
    />
  );
}

/** Logo đầy đủ (biểu tượng + chữ TRIỆU HỶ Media), kèm dòng phụ nếu có */
export function Logo({ className, subtitle }: { className?: string; subtitle?: string }) {
  return (
    <span className={cn("flex min-w-0 items-center gap-2.5", className)}>
      <Image
        src="/brand/logo.png"
        alt={ALT}
        width={800}
        height={259}
        priority
        className="h-11 w-auto shrink-0 object-contain"
      />
      {subtitle ? (
        <span className="hidden truncate border-l pl-2.5 text-xs leading-tight text-muted-foreground sm:block">{subtitle}</span>
      ) : null}
    </span>
  );
}
