import "server-only";
import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { serverEnv } from "./env";
import { ApiError } from "./http";

/** Chuyển khoá lưu trữ thành đường dẫn tuyệt đối, chặn path traversal */
function resolveKey(key: string): string {
  const root = serverEnv.storageDir;
  const full = path.resolve(root, key);
  if (!full.startsWith(root + path.sep)) throw new ApiError("bad_request", "invalid storage key");
  return full;
}

export async function saveFile(key: string, data: Uint8Array): Promise<void> {
  const full = resolveKey(key);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, data);
}

export async function removePrefix(prefix: string): Promise<void> {
  await rm(resolveKey(prefix), { recursive: true, force: true });
}

/** Ghi stream xuống đĩa, dừng và xoá tệp nếu vượt maxBytes; trả về dung lượng */
export async function saveStream(key: string, body: ReadableStream<Uint8Array>, maxBytes: number): Promise<number> {
  const full = resolveKey(key);
  await mkdir(path.dirname(full), { recursive: true });
  let size = 0;
  const limit = new Transform({
    transform(chunk: Buffer, _enc, done) {
      size += chunk.length;
      if (size > maxBytes) done(new ApiError("bad_request", "file too large"));
      else done(null, chunk);
    },
  });
  try {
    await pipeline(Readable.fromWeb(body as import("node:stream/web").ReadableStream), limit, createWriteStream(full));
  } catch (error) {
    await rm(full, { force: true });
    throw error instanceof ApiError ? error : new ApiError("bad_request", "upload interrupted");
  }
  return size;
}

export async function fileSize(key: string): Promise<number> {
  const info = await stat(resolveKey(key)).catch(() => null);
  if (!info?.isFile()) throw new ApiError("not_found", "file missing");
  return info.size;
}

/** Mở tệp (cả tệp hoặc một đoạn byte cho Range request của video) */
export async function openFile(key: string, range?: { start: number; end: number }): Promise<{ stream: ReadableStream<Uint8Array>; size: number }> {
  const full = resolveKey(key);
  const info = await stat(full).catch(() => null);
  if (!info?.isFile()) throw new ApiError("not_found", "file missing");
  const stream = Readable.toWeb(createReadStream(full, range)) as ReadableStream<Uint8Array>;
  return { stream, size: info.size };
}

/** Tên tệp an toàn cho khoá lưu trữ */
export function safeFileName(name: string): string {
  const base = name.normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
  return base.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-").slice(-120) || "file";
}
