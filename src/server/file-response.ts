import "server-only";
import { fileSize, openFile } from "./storage";

/**
 * Trả tệp dạng stream; inline để đọc trực tiếp, attachment khi tải xuống.
 * Hỗ trợ header Range (206) để trình phát video tua được mà không tải cả tệp.
 */
export async function fileResponse(
  key: string,
  opts: { title: string; mime: string | null; download: boolean; range?: string | null },
): Promise<Response> {
  const ext = key.split(".").pop() ?? "";
  const filename = `${opts.title}${ext ? `.${ext}` : ""}`;
  const disposition = `${opts.download ? "attachment" : "inline"}; filename*=UTF-8''${encodeURIComponent(filename)}`;
  const contentType = opts.mime && !opts.mime.endsWith("/*") ? opts.mime : guessMime(ext);
  const headers: Record<string, string> = {
    "Content-Type": contentType,
    "Content-Disposition": disposition,
    "Cache-Control": "private, max-age=300",
    "X-Content-Type-Options": "nosniff",
    "Accept-Ranges": "bytes",
  };
  // SVG/HTML có thể chứa script: chặn khi mở trực tiếp (PDF giữ nguyên để trình xem PDF hoạt động)
  if (contentType.includes("svg") || contentType.includes("html") || contentType.includes("xml")) {
    headers["Content-Security-Policy"] = "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; sandbox";
  }

  const match = opts.range && !opts.download ? /^bytes=(\d*)-(\d*)$/.exec(opts.range) : null;
  if (match) {
    const size = await fileSize(key);
    let start = match[1] ? Number(match[1]) : size - Number(match[2]);
    let end = match[1] && match[2] ? Number(match[2]) : size - 1;
    if (!match[1]) end = size - 1;
    start = Math.max(0, start);
    end = Math.min(end, size - 1);
    if (start > end || start >= size) {
      return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
    }
    const { stream } = await openFile(key, { start, end });
    headers["Content-Range"] = `bytes ${start}-${end}/${size}`;
    headers["Content-Length"] = String(end - start + 1);
    return new Response(stream, { status: 206, headers });
  }

  const { stream, size } = await openFile(key);
  headers["Content-Length"] = String(size);
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
    mp4: "video/mp4",
    m4v: "video/mp4",
    mov: "video/quicktime",
    webm: "video/webm",
  };
  return map[ext.toLowerCase()] ?? "application/octet-stream";
}
