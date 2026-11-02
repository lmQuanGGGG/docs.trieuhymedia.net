import { PrismaClient } from "@prisma/client";

/**
 * Singleton PrismaClient cho Next.js. Chỉ import từ Server Components / Route Handlers /
 * Server Actions, không bao giờ từ Client Component.
 * Ở môi trường dev, hot reload nạp lại module liên tục; lưu instance vào globalThis
 * để tránh mở thêm connection pool mỗi lần reload (dễ cạn max_connections của Postgres).
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const db: PrismaClient = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
