# Triệu Hỷ Media Docs

Cổng quản lý và chia sẻ tài liệu doanh nghiệp của TRIỆU HỶ MEDIA — `https://docs.trieuhymedia.net`.

## Chạy dự án

```bash
npm install
npm run dev        # http://localhost:3000 → tự chuyển về /vi
npm run build && npm start
```

## Công nghệ

Next.js 16 (App Router, `src/proxy.ts`) · TypeScript strict · Tailwind CSS v4 · shadcn/ui (Radix) · next-intl (vi / en / zh-CN) · next-themes · TanStack Table v8 · React Hook Form + Zod · Sonner · Prisma 6 + PostgreSQL (xem `docs/database.md`).

## Cấu trúc

| Thư mục | Nội dung |
|---|---|
| `src/app/[locale]/(app)` | Các trang nội bộ có sidebar: tổng quan, tài liệu, danh mục, chi tiết, thành viên, nhật ký, cài đặt |
| `src/app/[locale]/share/[token]` | Trang chia sẻ công khai, không có sidebar |
| `src/components/layout` | App shell: sidebar (desktop / rail tablet / drawer mobile), header, tìm kiếm ⌘K, chọn ngôn ngữ, theme |
| `src/components/documents` | Bảng, lưới, toolbar lọc/sắp xếp, menu ngữ cảnh, dialog upload/đổi tên/xoá/chia sẻ |
| `src/components/{dashboard,team,settings,share,shared}` | Các màn hình còn lại và component dùng chung |
| `src/lib/api` | Client gọi API (`DocsApi` → `http-adapter.ts`) |
| `src/lib/store` | State phía client: snapshot workspace từ API, dialog |
| `src/app/api`, `src/server` | Route Handlers, xác thực, phân quyền, service, kho tệp |
| `messages/` | Bản dịch; `vi.json` là nguồn, kiểu key được kiểm tra bởi TypeScript |
| `prisma/` | Schema, migration, seed (dữ liệu mẫu 4 thương hiệu) |

## Backend

- **Database:** PostgreSQL 16 trên droplet, chỉ nghe `127.0.0.1`. Máy dev kết nối qua SSH tunnel (xem `docs/database.md`), mở tunnel trước khi `npm run dev`.
- **Đăng nhập:** email + mật khẩu (bcrypt), phiên là JWT ký bằng `AUTH_SECRET`, lưu cookie httpOnly 7 ngày. `src/proxy.ts` chuyển người chưa đăng nhập về `/[locale]/login`.
- **Tài khoản dev:** mọi thành viên ACTIVE trong seed dùng chung mật khẩu `SEED_DEFAULT_PASSWORD` trong `.env.local`.
- **Phân quyền:** kiểm tra ở server (`src/server/permissions.ts`) cho mọi API; giao diện chỉ ẩn nút cho gọn.
- **Tệp:** lưu ở `STORAGE_DIR` (mặc định `./storage`), chỉ phục vụ qua `/api/documents/[id]/file` (có kiểm quyền) hoặc `/api/share/[token]/file` (kiểm hạn, mật khẩu, quyền tải).
- **Chia sẻ:** link công khai có mật khẩu (bcrypt), ngày hết hạn, bật/tắt tải xuống; mỗi lần mở trang được ghi lượt xem.
- **Chưa có:** gửi email mời (cần SMTP), chuyển PPTX → PDF (cần LibreOffice trên server), lưu cài đặt không gian lên DB, khôi phục từ thùng rác.

## Lưu ý quan trọng

- Dữ liệu seed là dữ liệu mẫu; chạy lại seed sẽ **xoá sạch** DB dev (`npx prisma db seed --config prisma/prisma.config.ts`).
- Thiết kế: nền trắng tinh, không gradient; card không viền + bóng mềm; kính mờ cho sidebar/header/menu nổi; nút bo tròn màu nhấn xanh lá `#4CAF50` (chữ/link `#2F9142`); logo giữ burgundy `#9B4148`. Token nằm trong `src/app/globals.css`.
