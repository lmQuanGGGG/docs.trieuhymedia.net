import "server-only";
import path from "node:path";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Thiếu biến môi trường ${name} (xem .env.example)`);
  return value;
}

export const serverEnv = {
  get authSecret(): Uint8Array {
    return new TextEncoder().encode(required("AUTH_SECRET"));
  },
  get storageDir(): string {
    return path.resolve(process.cwd(), process.env.STORAGE_DIR ?? "./storage");
  },
};
