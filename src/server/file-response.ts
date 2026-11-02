import "server-only";
import { openFile } from "./storage";

/** Trả tệp dạng stream; inline để đọc trực tiếp, attachment khi tải xuống */
export async function fileResponse(key: string, opts: { title: string; mime: string | null; download: boolean }): Promise<Response> {
  const { stream, size } = await openFile(key);
  const ext = key.split(".").pop() ?? "";
  const filename = `${opts.title}${ext ? `.${ext}` : ""}`;
  const disposition = `${opts.download ? "attachment" : "inline"}; filename*=UTF-8''${encodeURIComponent(filename)}`;
  const contentType = opts.mime && !opts.mime.endsWith("/*") ? opts.mime : guessMime(ext);
  const headers: Record<string, string> = {
    "Content-Type": contentType,
    "Content-Length": String(size),
    "Content-Disposition": disposition,
    "Cache-Control": "private, max-age=300",
    "X-Content-Type-Options": "nosniff",
  };
  // SVG/HTML có thể chứa script: chặn khi mở trực tiếp (PDF giữ nguyên để trình xem PDF hoạt động)
  if (contentType.includes("svg") || contentType.includes("html") || contentType.includes("xml")) {
    headers["Content-Security-Policy"] = "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; sandbox";
  }
  return new Response(stream, { headers });
}

function guessMime(ext: string): string {
  const map: Record<string, string> = {
    pdf: "application/pdf",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    svg: "image/svg+xml",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
  };
  return map[ext.toLowerCase()] ?? "application/octet-stream";
}
