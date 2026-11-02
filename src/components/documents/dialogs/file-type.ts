import type { DocumentType } from "@/types";

/** Đoán loại tài liệu từ tên tệp để hiển thị icon trước khi tải lên */
export function inferTypeFromFile(file: File): DocumentType {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) return "pdf";
  if (name.endsWith(".doc") || name.endsWith(".docx")) return "docx";
  if (name.endsWith(".ppt") || name.endsWith(".pptx")) return "pptx";
  if (name.endsWith(".xls") || name.endsWith(".xlsx") || name.endsWith(".csv")) return "xlsx";
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/") || /\.(mp4|m4v|mov|webm)$/.test(name)) return "video";
  return "docx";
}
