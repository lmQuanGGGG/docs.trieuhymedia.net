import "server-only";
import { createReadStream } from "node:fs";
import { mkdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
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

export async function openFile(key: string): Promise<{ stream: ReadableStream<Uint8Array>; size: number }> {
  const full = resolveKey(key);
  const info = await stat(full).catch(() => null);
  if (!info?.isFile()) throw new ApiError("not_found", "file missing");
  const stream = Readable.toWeb(createReadStream(full)) as ReadableStream<Uint8Array>;
  return { stream, size: info.size };
}

/** Tên tệp an toàn cho khoá lưu trữ */
export function safeFileName(name: string): string {
  const base = name.normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
  return base.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-").slice(-120) || "file";
}
