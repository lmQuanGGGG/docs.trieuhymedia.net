# Database — Triệu Hỷ Media Docs

## 1. Kiến trúc

```
Máy dev (Next.js)                         Droplet ubuntu-s-4vcpu-8gb-sgp1 (168.144.141.167)
DATABASE_URL=localhost:5433  ──SSH tunnel──▶  PostgreSQL 16 (native, apt) 127.0.0.1:5432
                                              ├─ database trieuhy_docs         (dữ liệu thật)
                                              └─ database trieuhy_docs_shadow  (chỉ cho prisma migrate dev)
```

- **PostgreSQL 16.x native** (gói `postgresql-16` của Ubuntu 24.04), service `postgresql@16-main`, tự khởi động cùng máy.
  - Chọn native thay vì Docker vì droplet không có Docker và đang chạy aaPanel (BT-Panel) + nginx + MySQL + Redis cho website khác. Cài Docker sẽ thêm chain iptables và có thể xung đột với firewall của panel; Postgres native nhẹ hơn và không đụng tới các dịch vụ đang chạy.
  - Cấu hình mặc định: `listen_addresses = 'localhost'` → chỉ nghe `127.0.0.1:5432` và `[::1]:5432`. **Không mở 5432 ra Internet**, không thêm rule ufw.
  - Thư mục dự án trên server: `/opt/trieuhymedia-docs/` (`db/backup.sh`, `backups/`).
- **User/DB:** role `trieuhy_app` (không phải superuser, không CREATEDB) sở hữu `trieuhy_docs` và `trieuhy_docs_shadow`. Mật khẩu ngẫu nhiên 64 ký tự hex, chỉ nằm trong `.env.local` (không commit) và trong Postgres.
- **ORM:** Prisma 6 (`prisma` + `@prisma/client` 6.19). Chọn Prisma 6 thay vì 7 vì Prisma 7 bắt buộc driver adapter (`@prisma/adapter-pg` + `pg`), trong khi phase này chỉ được thêm 2 gói Prisma. Muốn nâng lên 7 thì xem mục 7.

### File liên quan

| File | Vai trò |
| --- | --- |
| `prisma/schema.prisma` | Schema (models, enums, index) |
| `prisma/prisma.config.ts` | Cấu hình Prisma CLI, tự nạp `.env.local`, khai báo lệnh seed |
| `prisma/migrations/` | Migration SQL (commit vào git) |
| `prisma/seed.ts` | Dữ liệu mẫu cho 4 brand, id khớp mock data frontend |
| `src/server/db.ts` | Singleton `PrismaClient` (`import { db } from "@/server/db"`) |
| `.env.local` | Thông tin kết nối thật (bị `.gitignore` chặn) |
| `.env.example` | Mẫu biến môi trường |

### Mô hình dữ liệu (tóm tắt)

- `Workspace` — cấu hình công ty (tên, logo, màu nhấn, footer trang public).
- `Member` (role `SUPER_ADMIN|ADMIN|EDITOR|VIEWER|EXTERNAL_GUEST`, status `ACTIVE|INVITED|SUSPENDED`), `Invitation` (token unique, hết hạn).
- `Folder` (cây thư mục qua `parentId`), `Document` (soft delete bằng `deletedAt`, `tags text[]` có GIN index, `sizeBytes BigInt`).
- `DocumentVersion` (unique `documentId + version`), `DocumentStar` & `DocumentAccess` (khóa chính kép) cho "Đã gắn sao" / "Được chia sẻ với tôi".
- `ShareLink` (token unique, `passwordHash`, hết hạn, cho phép tải) + `ShareView` (analytics).
- `ActivityLog` (action enum, `metadata Json`).
- Tên bảng dạng snake_case số nhiều (`@@map`), cột giữ camelCase.
- Enum DB viết HOA (`PROPOSAL`, `IN_REVIEW`…), frontend dùng slug thường (`proposals`, `review`…): cần một lớp mapping ở data layer khi thay mock bằng DB.

## 2. Mở SSH tunnel (máy dev)

Cần SSH key được phép vào droplet (hiện tại: `~/.ssh/cocodrama_digitalocean`, user `root`).

```bash
# Giữ terminal này mở trong lúc làm việc với DB
ssh -N -L 5433:127.0.0.1:5432 -i ~/.ssh/cocodrama_digitalocean root@168.144.141.167

# Hoặc chạy nền, rồi đóng khi xong
ssh -f -N -o ExitOnForwardFailure=yes -L 5433:127.0.0.1:5432 -i ~/.ssh/cocodrama_digitalocean root@168.144.141.167
pkill -f "5433:127.0.0.1:5432"
```

Cổng local là **5433** để không đụng Postgres cài sẵn trên máy dev (nếu có).

## 3. Migrate & seed

Config Prisma nằm trong `prisma/`, nên mọi lệnh CLI thêm `--config prisma/prisma.config.ts` (config tự nạp `.env.local`):

```bash
# Tạo migration mới sau khi sửa schema (dev, cần tunnel)
npx prisma migrate dev --name <ten_thay_doi> --config prisma/prisma.config.ts

# Áp migration đã có (staging/production, không dùng shadow DB, không reset)
npx prisma migrate deploy --config prisma/prisma.config.ts

# Kiểm tra trạng thái
npx prisma migrate status --config prisma/prisma.config.ts

# Sinh lại Prisma Client (sau npm install / sửa schema)
npx prisma generate --config prisma/prisma.config.ts

# Seed dữ liệu mẫu (XÓA SẠCH các bảng nghiệp vụ rồi nạp lại!)
npx prisma db seed --config prisma/prisma.config.ts

# Xem dữ liệu
npx prisma studio --config prisma/prisma.config.ts
```

- Seed dùng `npx --yes tsx@4` (không thêm `tsx` vào package.json). Seed từ chối chạy khi `NODE_ENV=production` trừ khi đặt `SEED_ALLOW_RESET=1`.
- Dữ liệu seed: 8 thành viên, 6 thư mục, 25 tài liệu (22 tài liệu trùng id với `src/lib/mock/data.ts`, thêm `d-023`…`d-025`, trong đó `d-025` nằm trong thùng rác), 30 phiên bản, 6 share link (token trùng `shareToken` ở mock), 177 lượt xem, 10 activity.
- Nên thêm script vào `package.json` khi tiện, ví dụ `"db:migrate": "prisma migrate dev --config prisma/prisma.config.ts"`. Phase này chưa thêm vì phạm vi chỉ cho phép cài gói Prisma.

## 4. Backup & restore

Cron `/etc/cron.d/trieuhymedia-docs-backup` chạy `/opt/trieuhymedia-docs/db/backup.sh` lúc **02:30 UTC (09:30 giờ VN)** mỗi ngày:
`pg_dump --format=custom` → `/opt/trieuhymedia-docs/backups/trieuhy_docs-YYYYMMDD-HHMMSS.dump` (quyền 600, thư mục 700), giữ **7 bản** mới nhất. Log: `/var/log/trieuhymedia-docs-backup.log`.

```bash
# Backup thủ công
ssh root@168.144.141.167 /opt/trieuhymedia-docs/db/backup.sh

# Tải bản backup về máy
scp root@168.144.141.167:/opt/trieuhymedia-docs/backups/trieuhy_docs-<ts>.dump .

# Restore đè lên DB hiện có (trên server) — cẩn thận, ghi đè dữ liệu
sudo -u postgres pg_restore --clean --if-exists --no-owner --role=trieuhy_app \
  -d trieuhy_docs /opt/trieuhymedia-docs/backups/trieuhy_docs-<ts>.dump

# Restore an toàn: khôi phục vào DB mới để kiểm tra trước
sudo -u postgres createdb -O trieuhy_app trieuhy_docs_restore
sudo -u postgres pg_restore --no-owner --role=trieuhy_app -d trieuhy_docs_restore <file.dump>
```

Backup hiện chỉ nằm trên cùng droplet. Nên bật thêm **DigitalOcean Droplet Backups/Snapshots** hoặc đẩy file dump sang DO Spaces để có bản sao ngoài máy.

## 5. Khi deploy app lên chính droplet

- Đổi `DATABASE_URL` sang `localhost:5432` (không cần tunnel), giữ user `trieuhy_app`.
- Chỉ chạy `prisma migrate deploy`, không bao giờ `migrate dev`/`db seed` trên production. `SHADOW_DATABASE_URL` không cần ở production.
- Nếu app chạy trên droplet khác trong VPC `default-sgp1`: thêm `10.104.0.2` vào `listen_addresses`, thêm dòng `pg_hba.conf` `host trieuhy_docs trieuhy_app <ip-droplet-app>/32 scram-sha-256`, và mở ufw cho đúng IP nguồn đó (`ufw allow from <ip> to any port 5432 proto tcp`), không mở cho Anywhere.
- Prisma pool mặc định = `num_cpus * 2 + 1`; với Next.js nhiều worker, đặt `?connection_limit=` trong URL cho hợp lý (Postgres mặc định `max_connections=100`).

## 6. Lưu ý bảo mật cho phase sau

- **Không bao giờ** đưa 5432 ra Internet hay commit `.env.local`. Lưu ý `.gitignore` hiện chặn `.env*` nên `.env.example` cũng bị ignore — thêm dòng `!.env.example` nếu muốn commit file mẫu.
- **MySQL 3306 đang mở ra Internet** trên droplet (rule ufw `3306/tcp ALLOW Anywhere`, mysqld nghe `*:3306`) — thuộc dịch vụ khác, chưa đụng tới, nhưng nên đóng hoặc giới hạn IP.
- Panel aaPanel mở cổng 39738, 888, 8888, 20/21 (FTP) và dải 39000–40000 ra Internet — nên rà lại.
- SSH đang dùng root + key. Nên tạo user deploy riêng, tắt `PermitRootLogin`, cân nhắc `fail2ban`.
- Mật khẩu share link: chỉ lưu `passwordHash` (argon2id/bcrypt). Token share/invite sinh bằng `crypto.randomBytes(32)` dạng base64url, không dùng token dễ đoán như dữ liệu seed.
- Quyền truy cập tài liệu phải được kiểm tra ở server (Route Handler / Server Action) dựa trên `Member.role` + `DocumentAccess` + `visibility`, không tin dữ liệu từ client. Mọi query danh sách phải lọc `deletedAt: null`.
- `src/server/db.ts` chỉ được import từ code server. Cân nhắc cài gói `server-only` để chặn import nhầm từ Client Component.
- Đổi mật khẩu DB định kỳ: `sudo -u postgres psql -c "ALTER ROLE trieuhy_app PASSWORD '...'"` rồi cập nhật `.env.local`/biến môi trường production.

## 7. Nâng cấp lên Prisma 7 (khi được phép thêm dependency)

1. `npm i -D prisma@7 && npm i @prisma/client@7 @prisma/adapter-pg pg`.
2. Generator đổi sang `provider = "prisma-client"` với `output` bắt buộc; bỏ `url` khỏi `datasource` và khai báo trong `prisma.config.ts` (`datasource: { url: env("DATABASE_URL") }`).
3. `src/server/db.ts`: `new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })`.
