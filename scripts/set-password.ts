/**
 * Đặt mật khẩu cho một tài khoản (dev/ops). Mật khẩu nhập ẩn, không lưu lịch sử shell.
 * Chạy: npm run set-password -- email@trieuhymedia.net
 */
import { existsSync } from "node:fs";
import path from "node:path";
import { loadEnvFile, stdin, stdout } from "node:process";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const envFile = path.resolve(process.cwd(), ".env.local");
if (!process.env.DATABASE_URL && existsSync(envFile)) loadEnvFile(envFile);

function askHidden(question: string): Promise<string> {
  return new Promise((resolve) => {
    stdout.write(question);
    stdin.setRawMode?.(true);
    stdin.resume();
    let value = "";
    const onData = (buf: Buffer) => {
      for (const ch of buf.toString("utf8")) {
        if (ch === "\r" || ch === "\n") {
          stdin.setRawMode?.(false);
          stdin.pause();
          stdin.off("data", onData);
          stdout.write("\n");
          resolve(value);
          return;
        }
        if (ch === "\u0003") process.exit(130);
        if (ch === "\u007f") value = value.slice(0, -1);
        else value += ch;
      }
    };
    stdin.on("data", onData);
  });
}

async function main() {
  const email = process.argv[2]?.toLowerCase();
  if (!email) throw new Error("Cách dùng: npm run set-password -- <email>");
  const db = new PrismaClient();
  try {
    const member = await db.member.findUnique({ where: { email } });
    if (!member) throw new Error(`Không có tài khoản ${email}`);
    const password = await askHidden(`Mật khẩu mới cho ${member.name}: `);
    if (password.length < 8) throw new Error("Mật khẩu cần ít nhất 8 ký tự");
    const again = await askHidden("Nhập lại: ");
    if (again !== password) throw new Error("Hai lần nhập không khớp");
    await db.member.update({
      where: { id: member.id },
      // Đặt mật khẩu cũng kích hoạt thành viên đang ở trạng thái "đã mời"
      data: { passwordHash: await bcrypt.hash(password, 10), status: member.status === "INVITED" ? "ACTIVE" : member.status },
    });
    console.log(`Đã đặt mật khẩu cho ${email}.`);
  } finally {
    await db.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
