// Cấu hình Prisma CLI (Prisma 6). Đặt trong thư mục prisma/ nên mọi lệnh CLI cần
// `--config prisma/prisma.config.ts` (xem docs/database.md).
// Khi có file config, Prisma CLI KHÔNG tự đọc .env, nên ta tự nạp .env.local (quy ước Next.js).
import { existsSync } from "node:fs";
import path from "node:path";
import { loadEnvFile } from "node:process";
import { defineConfig } from "prisma/config";

const envFile = path.resolve(process.cwd(), ".env.local");
if (existsSync(envFile)) {
  loadEnvFile(envFile);
}

export default defineConfig({
  // Đường dẫn tương đối được resolve theo thư mục chứa file config này.
  schema: "./schema.prisma",
  migrations: {
    path: "./migrations",
    // tsx chạy qua npx (không thêm vào package.json theo yêu cầu dự án)
    seed: "npx --yes tsx@4 prisma/seed.ts",
  },
});
