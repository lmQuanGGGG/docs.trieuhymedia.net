import { cn } from "@/lib/utils";
import type { Member } from "@/types";

const sizes = { xs: "size-5 text-[9px]", sm: "size-7 text-[11px]", md: "size-9 text-xs", lg: "size-12 text-sm" } as const;

export function MemberAvatar({
  member,
  size = "sm",
  className,
}: {
  member: Pick<Member, "initials" | "color" | "name"> | undefined;
  size?: keyof typeof sizes;
  className?: string;
}) {
  return (
    <span
      title={member?.name}
      style={{ backgroundColor: member?.color ?? "#71717A" }}
      className={cn(
        "inline-grid shrink-0 place-items-center rounded-full font-semibold text-white",
        sizes[size],
        className,
      )}
    >
      {member?.initials ?? "?"}
    </span>
  );
}
