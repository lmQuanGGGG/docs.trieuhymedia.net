import { FileImage, FileSpreadsheet, FileText, FileType2, FileVideo, Link2, type LucideIcon, Presentation } from "lucide-react";
import { FileIcon3D } from "@/components/icons3d";
import type { DocumentType } from "@/types";

export const fileTypeMeta: Record<DocumentType, { icon: LucideIcon; color: string; label: string }> = {
  pdf: { icon: FileText, color: "#B4434B", label: "PDF" },
  docx: { icon: FileType2, color: "#3B5F8A", label: "DOC" },
  pptx: { icon: Presentation, color: "#C2603A", label: "PPT" },
  xlsx: { icon: FileSpreadsheet, color: "#3F7D58", label: "XLS" },
  image: { icon: FileImage, color: "#8A6A3B", label: "IMG" },
  video: { icon: FileVideo, color: "#1F6F8B", label: "MP4" },
  link: { icon: Link2, color: "#52525B", label: "URL" },
};

const sizes = { sm: 28, md: 36, lg: 48 } as const;

/** Icon loại tệp dạng tờ giấy 3D có nhãn định dạng */
export function FileTypeIcon({
  type,
  className,
  size = "md",
}: {
  type: DocumentType;
  className?: string;
  size?: keyof typeof sizes;
}) {
  return <FileIcon3D type={type} size={sizes[size]} className={className ? `shrink-0 ${className}` : "shrink-0"} />;
}
