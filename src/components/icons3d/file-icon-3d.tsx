import type { ReactElement } from "react";
import { cn } from "@/lib/utils";
import { Ground, block, roundRect, solid, tone } from "./geometry";
import { lines, sheet } from "./parts";

export type FileIcon3DType = "pdf" | "docx" | "pptx" | "xlsx" | "image" | "video" | "link";

const FILES: Record<FileIcon3DType, { color: string; label: string }> = {
  pdf: { color: "#B4434B", label: "PDF" },
  docx: { color: "#3B5F8A", label: "DOC" },
  pptx: { color: "#C2603A", label: "PPT" },
  xlsx: { color: "#3F7D58", label: "XLS" },
  image: { color: "#8A6A3B", label: "IMG" },
  video: { color: "#1F6F8B", label: "MP4" },
  link: { color: "#52525B", label: "URL" },
};

/** Ký hiệu thay chữ khi icon quá nhỏ (< 24px). */
function glyph(type: FileIcon3DType, fill: string): ReactElement {
  switch (type) {
    case "pdf":
      return <rect x={18} y={34} width={14} height={4} rx={2} fill={fill} />;
    case "docx":
      return (
        <g fill={fill}>
          <rect x={15} y={32.5} width={20} height={2.6} rx={1.3} />
          <rect x={15} y={37.4} width={14} height={2.6} rx={1.3} />
        </g>
      );
    case "pptx":
      return (
        <g fill={fill}>
          <rect x={17} y={36} width={4} height={5} rx={0.8} />
          <rect x={23} y={33} width={4} height={8} rx={0.8} />
          <rect x={29} y={30.5} width={4} height={10.5} rx={0.8} />
        </g>
      );
    case "xlsx":
      return (
        <g fill={fill}>
          <rect x={15} y={31} width={9} height={4} rx={0.8} />
          <rect x={26} y={31} width={9} height={4} rx={0.8} />
          <rect x={15} y={37} width={9} height={4} rx={0.8} />
          <rect x={26} y={37} width={9} height={4} rx={0.8} />
        </g>
      );
    case "image":
      return <path d="M14.5 41.5 21 33l4.5 5.5 3-3.5 6 6.5Z" fill={fill} />;
    case "video":
      return <path d="M20 31.5v10l9-5Z" fill={fill} />;
    case "link":
      return (
        <g fill="none" stroke={fill} strokeWidth={2.4}>
          <rect x={13.5} y={32.5} width={12} height={7} rx={3.5} />
          <rect x={23.5} y={32.5} width={12} height={7} rx={3.5} />
        </g>
      );
  }
}

/** Icon tệp: tờ giấy gấp góc + dải nhãn màu ghi định dạng. */
export function FileIcon3D({
  type,
  size = 36,
  className,
}: {
  type: FileIcon3DType;
  size?: number;
  className?: string;
}) {
  const { color, label } = FILES[type];
  const s = solid(color);
  const ink = tone(color, 0.95);
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
      <Ground cx={31} rx={18} />
      {sheet(14, 7, 31, 47, 10, color, 3)}
      {lines(19, [14.5, 19.5], [12, 16], color)}
      {lines(19, [48], [18], color)}
      {block(roundRect(7.5, 26.5, 35, 18, 2.5), 2, s)}
      {size < 24 ? (
        glyph(type, ink)
      ) : (
        <text
          x={25}
          y={40.4}
          textAnchor="middle"
          fontSize={13.5}
          fontWeight={800}
          letterSpacing={0.2}
          fontFamily="var(--font-inter), ui-sans-serif, system-ui, sans-serif"
          fill={ink}
        >
          {label}
        </text>
      )}
    </svg>
  );
}
