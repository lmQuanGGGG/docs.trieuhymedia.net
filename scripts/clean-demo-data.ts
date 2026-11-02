/**
 * Xoá dữ liệu mẫu khỏi DB và kho tệp, giữ lại: workspace, 4 thư mục thương hiệu,
 * các tài khoản quản trị (KEEP_MEMBERS). Không đụng mật khẩu đã đặt.
 * Chạy: npx --yes tsx@4 scripts/clean-demo-data.ts
 */
import { existsSync, rmSync } from "node:fs";
import path from "node:path";
import { loadEnvFile } from "node:process";
import { PrismaClient } from "@prisma/client";

const envFile = path.resolve(process.cwd(), ".env.local");
if (!process.env.DATABASE_URL && existsSync(envFile)) loadEnvFile(envFile);

const KEEP_MEMBERS = ["tien@trieuhymedia.net", "ly.do@trieuhymedia.net"];
const BRAND_FOLDERS = ["f-thm", "f-garden", "f-coco", "f-tasting"];

async function main() {
  const db = new PrismaClient();
  try {
    const keep = await db.member.findMany({ where: { email: { in: KEEP_MEMBERS } }, select: { id: true } });
    const keepIds = keep.map((m) => m.id);
    if (keepIds.length === 0) throw new Error("Không tìm thấy tài khoản quản trị để giữ lại, dừng để tránh xoá nhầm.");

    const [docs] = await db.$transaction([
      db.document.deleteMany({}),
      db.activityLog.deleteMany({}),
      db.invitation.deleteMany({}),
      db.folder.deleteMany({ where: { id: { notIn: BRAND_FOLDERS } } }),
      // Thư mục thương hiệu gán người tạo là quản trị viên còn giữ lại
      db.folder.updateMany({ where: { id: { in: BRAND_FOLDERS } }, data: { createdById: keepIds[0] } }),
      db.member.deleteMany({ where: { id: { notIn: keepIds } } }),
      db.member.updateMany({ data: { notificationsReadAt: null } }),
    ]);

    const storage = path.resolve(process.cwd(), process.env.STORAGE_DIR ?? "./storage", "documents");
    rmSync(storage, { recursive: true, force: true });

    const [members, folders, documents] = await Promise.all([db.member.count(), db.folder.count(), db.document.count()]);
    console.log(`Đã xoá ${docs.count} tài liệu mẫu. Còn lại: ${members} tài khoản, ${folders} thư mục, ${documents} tài liệu.`);
  } finally {
    await db.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
