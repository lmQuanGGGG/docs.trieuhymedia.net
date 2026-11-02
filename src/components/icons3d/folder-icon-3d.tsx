import { cn } from "@/lib/utils";
import { Ground, back, block, paper, rect, roundRect, solid, tone } from "./geometry";

/** Thư mục đóng 2.5D theo màu tuỳ chọn. */
export function FolderIcon3D({
  color,
  size = 36,
  className,
}: {
  color: string;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
    >
      <Ground cx={33} rx={22} />
      {block(
        [
          [8, 13],
          [22, 13],
          [26, 17.5],
          [50, 17.5],
          [50, 50],
          [8, 50],
        ],
        3,
        solid(tone(color, -0.14)),
      )}
      {block(back(rect(12, 20, 34, 12), 1.5), 1, paper(color), { edge: true })}
      {block(roundRect(8, 24, 42, 29, [1.5, 1.5, 3, 3]), 3, solid(color))}
      <rect x={21} y={30} width={16} height={2.4} rx={1.2} fill={tone(color, 0.35)} />
    </svg>
  );
}
