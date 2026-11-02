/**
 * Seed dữ liệu mẫu cho Triệu Hỷ Media Docs.
 * Id khớp với mock data của frontend (src/lib/mock/data.ts): m-01…, f-…, d-001…
 *
 * CẢNH BÁO: seed XÓA SẠCH dữ liệu các bảng nghiệp vụ rồi nạp lại. Chỉ chạy trên DB dev/staging.
 * Chặn chạy khi NODE_ENV=production trừ khi đặt SEED_ALLOW_RESET=1.
 *
 * Chạy: npx prisma db seed --config prisma/prisma.config.ts
 * Mặc định chỉ tạo khung: workspace, 4 thư mục thương hiệu, 2 tài khoản quản trị.
 * Thêm SEED_DEMO=1 để nạp kèm dữ liệu mẫu (tài liệu, thành viên giả, link chia sẻ…).
 */
import { copyFileSync, existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { loadEnvFile } from "node:process";
import {
  AccessPermission,
  ActivityAction,
  DocumentCategory,
  DocumentStatus,
  DocumentType,
  MemberStatus,
  Prisma,
  PrismaClient,
  Role,
  Visibility,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const envFile = path.resolve(process.cwd(), ".env.local");
if (!process.env.DATABASE_URL && existsSync(envFile)) {
  loadEnvFile(envFile);
}

if (process.env.NODE_ENV === "production" && process.env.SEED_ALLOW_RESET !== "1") {
  throw new Error("Từ chối seed trên production (đặt SEED_ALLOW_RESET=1 nếu thật sự muốn).");
}

const prisma = new PrismaClient();
const DEMO = process.env.SEED_DEMO === "1";
const BASE_MEMBERS = ["m-01", "m-02"];

type Brand = "Triệu Hỷ Media" | "HỶ GARDEN" | "Coco Drama" | "TASTING";

// Tệp mẫu trong public/samples được chép vào kho lưu trữ để API phục vụ như tệp thật
const SAMPLES_DIR = path.resolve(process.cwd(), "public/samples");
const STORAGE_DIR = path.resolve(process.cwd(), process.env.STORAGE_DIR ?? "./storage");
const SAMPLE_PDF = "sample:pdf";
const SAMPLE_FILE: Record<DocumentType, string | null> = {
  PDF: "trieu-hy-media-company-profile.pdf",
  DOCX: "hop-dong-dich-vu-mau.docx",
  PPTX: null,
  XLSX: "bao-gia-san-xuat-mau.xlsx",
  IMAGE: "hy-garden-moodboard.svg",
  LINK: null,
};

function putSample(sample: string, key: string): void {
  const target = path.join(STORAGE_DIR, key);
  mkdirSync(path.dirname(target), { recursive: true });
  copyFileSync(path.join(SAMPLES_DIR, sample), target);
}

const MIME: Record<DocumentType, string | null> = {
  PDF: "application/pdf",
  DOCX: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  PPTX: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  XLSX: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  IMAGE: "image/svg+xml",
  LINK: null,
};

const EXT: Record<DocumentType, string> = {
  PDF: "pdf",
  DOCX: "docx",
  PPTX: "pptx",
  XLSX: "xlsx",
  IMAGE: "svg",
  LINK: "",
};

const d = (iso: string): Date => new Date(iso);

// ─── Thành viên ─────────────────────────────────────────────────────────────

const members: Prisma.MemberCreateManyInput[] = [
  { id: "m-01", name: "Lê Thị Thanh Tiên", email: "tien@trieuhymedia.net", role: Role.SUPER_ADMIN, status: MemberStatus.ACTIVE, title: "Giám đốc điều hành", color: "#9B4148", createdAt: d("2026-01-02T09:00:00+07:00"), lastActiveAt: d("2026-11-02T08:52:00+07:00") },
  { id: "m-02", name: "Đỗ Thị Thanh Lý", email: "ly.do@trieuhymedia.net", role: Role.ADMIN, status: MemberStatus.ACTIVE, title: "Giám đốc", color: "#3F6E6A", createdAt: d("2026-01-05T09:00:00+07:00"), lastActiveAt: d("2026-11-02T08:10:00+07:00") },
  { id: "m-03", name: "Nguyễn Minh Khoa", email: "khoa.nguyen@trieuhymedia.net", role: Role.EDITOR, status: MemberStatus.ACTIVE, title: "Account Manager", color: "#B7791F", createdAt: d("2026-02-01T09:00:00+07:00"), lastActiveAt: d("2026-11-01T17:40:00+07:00") },
  { id: "m-04", name: "Trần Bảo Ngọc", email: "ngoc.tran@trieuhymedia.net", role: Role.EDITOR, status: MemberStatus.ACTIVE, title: "Creative Lead", color: "#C2603A", createdAt: d("2026-02-10T09:00:00+07:00"), lastActiveAt: d("2026-11-01T15:05:00+07:00") },
  { id: "m-05", name: "Phạm Gia Huy", email: "huy.pham@trieuhymedia.net", role: Role.EDITOR, status: MemberStatus.ACTIVE, title: "Producer — Coco Drama", color: "#6B7A3A", createdAt: d("2026-03-01T09:00:00+07:00"), lastActiveAt: d("2026-10-31T11:20:00+07:00") },
  { id: "m-06", name: "Võ Thu Hà", email: "ha.vo@trieuhymedia.net", role: Role.VIEWER, status: MemberStatus.ACTIVE, title: "Kế toán", color: "#52525B", createdAt: d("2026-03-15T09:00:00+07:00"), lastActiveAt: d("2026-10-30T09:00:00+07:00") },
  { id: "m-07", name: "Lã Trưng Kỳ", email: "lu.zhengqi@partner.cn", role: Role.EXTERNAL_GUEST, status: MemberStatus.ACTIVE, title: "Đối tác sản xuất (Trung Quốc)", color: "#B4536A", createdAt: d("2026-10-20T09:00:00+07:00"), lastActiveAt: d("2026-10-27T10:42:00+07:00") },
  { id: "m-08", name: "Hoàng Anh Thư", email: "thu.hoang@trieuhymedia.net", role: Role.VIEWER, status: MemberStatus.INVITED, title: "Marketing Executive", color: "#71717A", createdAt: d("2026-10-29T14:00:00+07:00"), lastActiveAt: null },
];

// ─── Thư mục ────────────────────────────────────────────────────────────────

const folders: Prisma.FolderCreateManyInput[] = [
  { id: "f-thm", name: "Triệu Hỷ Media", brand: "Triệu Hỷ Media", parentId: null, color: "#9B4148", createdById: "m-01" },
  { id: "f-garden", name: "HỶ GARDEN", brand: "HỶ GARDEN", parentId: null, color: "#3F6E6A", createdById: "m-01" },
  { id: "f-coco", name: "Coco Drama", brand: "Coco Drama", parentId: null, color: "#C2603A", createdById: "m-01" },
  { id: "f-tasting", name: "TASTING", brand: "TASTING", parentId: null, color: "#B7791F", createdById: "m-01" },
  { id: "f-thm-sales", name: "Kinh doanh 2026", brand: "Triệu Hỷ Media", parentId: "f-thm", color: "#9B4148", createdById: "m-02" },
  { id: "f-coco-ott", name: "Đối tác OTT", brand: "Coco Drama", parentId: "f-coco", color: "#C2603A", createdById: "m-05" },
];

// ─── Tài liệu ───────────────────────────────────────────────────────────────

/** [version, note, authorId, createdAt, sizeBytes] */
type VersionTuple = [number, string, string, string, number];

interface SeedDocument {
  id: string;
  title: string;
  description: string;
  type: DocumentType;
  category: DocumentCategory;
  brand: Brand;
  folderId: string | null;
  ownerId: string;
  status: DocumentStatus;
  visibility: Visibility;
  createdAt: string;
  updatedAt: string;
  sizeBytes: number;
  pages?: number;
  tags: string[];
  previewUrl?: string;
  externalUrl?: string;
  shareToken?: string;
  versions: VersionTuple[];
  deletedAt?: string;
}

const T = DocumentType;
const C = DocumentCategory;
const S = DocumentStatus;
const V = Visibility;

const documents: SeedDocument[] = [
  { id: "d-001", title: "Hồ sơ năng lực Triệu Hỷ Media 2026", description: "Giới thiệu công ty, năng lực sản xuất nội dung, khách hàng tiêu biểu và quy trình làm việc.", type: T.PDF, category: C.COMPANY_PROFILE, brand: "Triệu Hỷ Media", folderId: "f-thm", ownerId: "m-01", status: S.APPROVED, visibility: V.PUBLIC, createdAt: "2026-09-12T10:00:00+07:00", updatedAt: "2026-11-01T16:20:00+07:00", sizeBytes: 8_420_000, pages: 24, tags: ["company", "2026"], previewUrl: SAMPLE_PDF, shareToken: "thm-profile-2026",
    versions: [[1, "Phiên bản đầu tiên", "m-01", "2026-09-12T10:00:00+07:00", 6_500_000], [2, "Bổ sung mảng phim ngắn AI", "m-04", "2026-10-15T09:30:00+07:00", 7_980_000], [3, "Cập nhật khách hàng Q4", "m-01", "2026-11-01T16:20:00+07:00", 8_420_000]] },
  { id: "d-002", title: "Proposal hợp tác phim ngắn — TV360", description: "Đề xuất cung cấp phim ngắn sản xuất bằng AI cho nền tảng TV360, kèm phương án thanh toán.", type: T.PDF, category: C.PROPOSAL, brand: "Coco Drama", folderId: "f-coco-ott", ownerId: "m-02", status: S.IN_REVIEW, visibility: V.TEAM, createdAt: "2026-10-27T13:50:00+07:00", updatedAt: "2026-11-02T08:30:00+07:00", sizeBytes: 3_150_000, pages: 14, tags: ["ott", "short-drama"], previewUrl: SAMPLE_PDF,
    versions: [[1, "Bản nháp", "m-02", "2026-10-27T13:50:00+07:00", 2_800_000], [2, "Thêm phương án thanh toán 2", "m-02", "2026-11-02T08:30:00+07:00", 3_150_000]] },
  { id: "d-003", title: "Báo giá sản xuất 80 tập phim ngắn", description: "Báo giá theo phút, tiến độ giao hàng theo đợt 10 tập.", type: T.XLSX, category: C.QUOTATION, brand: "Coco Drama", folderId: "f-coco-ott", ownerId: "m-03", status: S.DRAFT, visibility: V.PRIVATE, createdAt: "2026-10-28T09:00:00+07:00", updatedAt: "2026-11-01T11:45:00+07:00", sizeBytes: 182_000, tags: ["pricing"],
    versions: [[1, "Bản nháp", "m-03", "2026-10-28T09:00:00+07:00", 182_000]] },
  { id: "d-004", title: "HỶ GARDEN — Brand Guideline", description: "Logo, bảng màu, typography và quy chuẩn hình ảnh của HỶ GARDEN.", type: T.PDF, category: C.BRAND_ASSET, brand: "HỶ GARDEN", folderId: "f-garden", ownerId: "m-04", status: S.APPROVED, visibility: V.TEAM, createdAt: "2026-08-02T10:00:00+07:00", updatedAt: "2026-10-30T15:10:00+07:00", sizeBytes: 12_600_000, pages: 36, tags: ["brand"], previewUrl: SAMPLE_PDF,
    versions: [[1, "Phiên bản đầu tiên", "m-04", "2026-08-02T10:00:00+07:00", 10_900_000], [2, "Thêm phần bao bì", "m-04", "2026-10-30T15:10:00+07:00", 12_600_000]] },
  { id: "d-005", title: "Hợp đồng dịch vụ truyền thông — TASTING", description: "Hợp đồng khung dịch vụ truyền thông mạng xã hội 12 tháng.", type: T.DOCX, category: C.CONTRACT, brand: "TASTING", folderId: "f-tasting", ownerId: "m-02", status: S.IN_REVIEW, visibility: V.PRIVATE, createdAt: "2026-10-10T14:00:00+07:00", updatedAt: "2026-10-31T10:05:00+07:00", sizeBytes: 96_000, tags: ["legal"],
    versions: [[1, "Bản nháp", "m-02", "2026-10-10T14:00:00+07:00", 88_000], [2, "Sửa điều khoản thanh toán", "m-02", "2026-10-31T10:05:00+07:00", 96_000]] },
  { id: "d-006", title: "Coco Drama — Pitch Deck mùa 2", description: "Giới thiệu dòng phim ngắn Coco Drama mùa 2 cho nhà đầu tư và đối tác phát hành.", type: T.PPTX, category: C.PRESENTATION, brand: "Coco Drama", folderId: "f-coco", ownerId: "m-05", status: S.APPROVED, visibility: V.PUBLIC, createdAt: "2026-09-20T10:00:00+07:00", updatedAt: "2026-10-29T17:30:00+07:00", sizeBytes: 24_800_000, pages: 28, tags: ["pitch"], shareToken: "coco-pitch-s2",
    versions: [[1, "Phiên bản đầu tiên", "m-05", "2026-09-20T10:00:00+07:00", 24_800_000]] },
  { id: "d-007", title: "Portfolio dự án 2024–2026", description: "Tổng hợp các dự án tiêu biểu: TVC, phim ngắn, sự kiện và chiến dịch số.", type: T.PDF, category: C.PORTFOLIO, brand: "Triệu Hỷ Media", folderId: "f-thm", ownerId: "m-04", status: S.APPROVED, visibility: V.PUBLIC, createdAt: "2026-07-01T10:00:00+07:00", updatedAt: "2026-10-28T09:40:00+07:00", sizeBytes: 31_200_000, pages: 48, tags: ["portfolio"], previewUrl: SAMPLE_PDF, shareToken: "thm-portfolio",
    versions: [[3, "Tối ưu dung lượng", "m-04", "2026-09-02T09:00:00+07:00", 29_000_000], [4, "Thêm dự án Q3", "m-04", "2026-10-28T09:40:00+07:00", 31_200_000]] },
  { id: "d-008", title: "Đề xuất khai trương HỶ GARDEN chi nhánh 2", description: "Kế hoạch sự kiện, truyền thông và ngân sách khai trương.", type: T.DOCX, category: C.PROPOSAL, brand: "HỶ GARDEN", folderId: "f-garden", ownerId: "m-03", status: S.DRAFT, visibility: V.TEAM, createdAt: "2026-10-22T10:00:00+07:00", updatedAt: "2026-10-31T16:00:00+07:00", sizeBytes: 1_240_000, pages: 18, tags: ["event"],
    versions: [[1, "Bản nháp", "m-03", "2026-10-22T10:00:00+07:00", 1_240_000]] },
  { id: "d-009", title: "Bảng giá dịch vụ sản xuất video 2026", description: "Bảng giá chuẩn cho TVC, video ngắn, livestream và phim ngắn.", type: T.PDF, category: C.QUOTATION, brand: "Triệu Hỷ Media", folderId: "f-thm-sales", ownerId: "m-02", status: S.APPROVED, visibility: V.TEAM, createdAt: "2026-01-05T10:00:00+07:00", updatedAt: "2026-10-20T10:00:00+07:00", sizeBytes: 2_100_000, pages: 8, tags: ["pricing", "2026"], previewUrl: SAMPLE_PDF,
    versions: [[5, "Điều chỉnh giá Q4", "m-02", "2026-10-20T10:00:00+07:00", 2_100_000]] },
  { id: "d-010", title: "TASTING — Menu Launch Campaign", description: "Kế hoạch chiến dịch ra mắt menu mùa đông, KPI và lịch đăng bài.", type: T.PPTX, category: C.PRESENTATION, brand: "TASTING", folderId: "f-tasting", ownerId: "m-03", status: S.IN_REVIEW, visibility: V.TEAM, createdAt: "2026-10-18T10:00:00+07:00", updatedAt: "2026-10-30T11:00:00+07:00", sizeBytes: 18_400_000, pages: 22, tags: ["campaign"],
    versions: [[2, "Cập nhật KPI", "m-03", "2026-10-30T11:00:00+07:00", 18_400_000]] },
  { id: "d-011", title: "Bộ logo Triệu Hỷ Media (SVG/PNG)", description: "Logo chính, logo rút gọn, phiên bản sáng/tối.", type: T.IMAGE, category: C.BRAND_ASSET, brand: "Triệu Hỷ Media", folderId: "f-thm", ownerId: "m-04", status: S.APPROVED, visibility: V.PUBLIC, createdAt: "2026-03-01T10:00:00+07:00", updatedAt: "2026-10-12T10:00:00+07:00", sizeBytes: 4_600_000, tags: ["logo"],
    versions: [[2, "Thêm bản tối", "m-04", "2026-10-12T10:00:00+07:00", 4_600_000]] },
  { id: "d-012", title: "Hợp đồng đồng sản xuất phim ngắn AI", description: "Hợp đồng với đối tác sản xuất Trung Quốc: tiến độ, bản quyền, thanh toán.", type: T.DOCX, category: C.CONTRACT, brand: "Coco Drama", folderId: "f-coco-ott", ownerId: "m-01", status: S.IN_REVIEW, visibility: V.PRIVATE, createdAt: "2026-10-25T10:00:00+07:00", updatedAt: "2026-11-01T09:15:00+07:00", sizeBytes: 140_000, tags: ["legal", "partner"],
    versions: [[3, "Bổ sung điều khoản bản quyền", "m-01", "2026-11-01T09:15:00+07:00", 140_000]] },
  { id: "d-013", title: "Showreel Coco Drama 2026", description: "Liên kết video showreel trên kênh chính thức.", type: T.LINK, category: C.PORTFOLIO, brand: "Coco Drama", folderId: "f-coco", ownerId: "m-05", status: S.APPROVED, visibility: V.PUBLIC, createdAt: "2026-10-05T10:00:00+07:00", updatedAt: "2026-10-26T10:00:00+07:00", sizeBytes: 0, tags: ["video"], externalUrl: "https://www.youtube.com/",
    versions: [] },
  { id: "d-014", title: "Hồ sơ giới thiệu HỶ GARDEN", description: "Câu chuyện thương hiệu, không gian, thực đơn và dịch vụ sự kiện.", type: T.PDF, category: C.COMPANY_PROFILE, brand: "HỶ GARDEN", folderId: "f-garden", ownerId: "m-04", status: S.APPROVED, visibility: V.PUBLIC, createdAt: "2026-06-10T10:00:00+07:00", updatedAt: "2026-10-24T10:00:00+07:00", sizeBytes: 9_800_000, pages: 20, tags: ["profile"], previewUrl: SAMPLE_PDF, shareToken: "hy-garden-profile",
    versions: [[2, "Ảnh không gian mới", "m-04", "2026-10-24T10:00:00+07:00", 9_800_000]] },
  { id: "d-015", title: "Báo giá gói truyền thông TASTING Q1/2027", description: "Báo giá gói nội dung mạng xã hội và KOL cho quý 1.", type: T.XLSX, category: C.QUOTATION, brand: "TASTING", folderId: "f-tasting", ownerId: "m-02", status: S.DRAFT, visibility: V.PRIVATE, createdAt: "2026-10-30T10:00:00+07:00", updatedAt: "2026-10-31T18:00:00+07:00", sizeBytes: 64_000, tags: ["pricing"],
    versions: [[1, "Bản nháp", "m-02", "2026-10-30T10:00:00+07:00", 64_000]] },
  { id: "d-016", title: "Proposal chiến dịch Tết 2027 — TASTING", description: "Ý tưởng sáng tạo, kênh triển khai và ngân sách chiến dịch Tết.", type: T.PPTX, category: C.PROPOSAL, brand: "TASTING", folderId: "f-tasting", ownerId: "m-04", status: S.IN_REVIEW, visibility: V.TEAM, createdAt: "2026-10-20T10:00:00+07:00", updatedAt: "2026-10-29T10:00:00+07:00", sizeBytes: 21_000_000, pages: 30, tags: ["tet", "campaign"],
    versions: [[2, "Thêm phương án KOL", "m-04", "2026-10-29T10:00:00+07:00", 21_000_000]] },
  { id: "d-017", title: "Hồ sơ năng lực Coco Drama", description: "Năng lực sản xuất phim ngắn, đội ngũ và các tựa phim đã phát hành.", type: T.PDF, category: C.COMPANY_PROFILE, brand: "Coco Drama", folderId: "f-coco", ownerId: "m-05", status: S.APPROVED, visibility: V.PUBLIC, createdAt: "2026-05-15T10:00:00+07:00", updatedAt: "2026-10-16T10:00:00+07:00", sizeBytes: 6_700_000, pages: 16, tags: ["profile"], previewUrl: SAMPLE_PDF, shareToken: "coco-profile",
    versions: [[2, "Cập nhật tựa phim", "m-05", "2026-10-16T10:00:00+07:00", 6_700_000]] },
  { id: "d-018", title: "Ảnh không gian HỶ GARDEN (bộ 40 ảnh)", description: "Bộ ảnh chụp không gian và món ăn độ phân giải cao.", type: T.IMAGE, category: C.BRAND_ASSET, brand: "HỶ GARDEN", folderId: "f-garden", ownerId: "m-04", status: S.APPROVED, visibility: V.TEAM, createdAt: "2026-09-01T10:00:00+07:00", updatedAt: "2026-10-08T10:00:00+07:00", sizeBytes: 186_000_000, tags: ["photo"],
    versions: [] },
  { id: "d-019", title: "Kế hoạch nội dung TikTok tháng 11", description: "Lịch đăng, kịch bản ngắn và phân công cho 4 thương hiệu.", type: T.XLSX, category: C.PRESENTATION, brand: "Triệu Hỷ Media", folderId: "f-thm-sales", ownerId: "m-03", status: S.APPROVED, visibility: V.TEAM, createdAt: "2026-10-25T10:00:00+07:00", updatedAt: "2026-11-01T14:30:00+07:00", sizeBytes: 220_000, tags: ["social"],
    versions: [[3, "Chốt lịch tuần 1", "m-03", "2026-11-01T14:30:00+07:00", 220_000]] },
  { id: "d-020", title: "Mẫu hợp đồng KOL / KOC", description: "Mẫu hợp đồng hợp tác người có ảnh hưởng, đã qua pháp lý duyệt.", type: T.DOCX, category: C.CONTRACT, brand: "Triệu Hỷ Media", folderId: "f-thm", ownerId: "m-02", status: S.APPROVED, visibility: V.TEAM, createdAt: "2026-04-01T10:00:00+07:00", updatedAt: "2026-09-30T10:00:00+07:00", sizeBytes: 72_000, tags: ["template", "legal"],
    versions: [[4, "Cập nhật quy định quảng cáo", "m-02", "2026-09-30T10:00:00+07:00", 72_000]] },
  { id: "d-021", title: "Portfolio món ăn TASTING", description: "Bộ ảnh món ăn và concept chụp cho chiến dịch thực đơn.", type: T.PDF, category: C.PORTFOLIO, brand: "TASTING", folderId: "f-tasting", ownerId: "m-04", status: S.ARCHIVED, visibility: V.TEAM, createdAt: "2026-02-10T10:00:00+07:00", updatedAt: "2026-08-20T10:00:00+07:00", sizeBytes: 22_000_000, pages: 32, tags: ["food"], previewUrl: SAMPLE_PDF,
    versions: [] },
  { id: "d-022", title: "Proposal sản xuất TVC HỶ GARDEN", description: "Kịch bản, storyboard và báo giá sản xuất TVC 30 giây.", type: T.PDF, category: C.PROPOSAL, brand: "HỶ GARDEN", folderId: "f-garden", ownerId: "m-03", status: S.APPROVED, visibility: V.PUBLIC, createdAt: "2026-09-05T10:00:00+07:00", updatedAt: "2026-10-14T10:00:00+07:00", sizeBytes: 5_400_000, pages: 12, tags: ["tvc"], previewUrl: SAMPLE_PDF, shareToken: "hy-garden-tvc",
    versions: [[2, "Chốt storyboard", "m-03", "2026-10-14T10:00:00+07:00", 5_400_000]] },
  // Bổ sung để đủ ~25 tài liệu, phủ thêm trạng thái/thùng rác
  { id: "d-023", title: "Hồ sơ năng lực TASTING", description: "Giới thiệu concept ẩm thực, đội ngũ bếp và năng lực tổ chức tiệc.", type: T.PDF, category: C.COMPANY_PROFILE, brand: "TASTING", folderId: "f-tasting", ownerId: "m-04", status: S.APPROVED, visibility: V.PUBLIC, createdAt: "2026-07-20T10:00:00+07:00", updatedAt: "2026-10-05T10:00:00+07:00", sizeBytes: 7_300_000, pages: 18, tags: ["profile"], previewUrl: SAMPLE_PDF,
    versions: [[1, "Phiên bản đầu tiên", "m-04", "2026-07-20T10:00:00+07:00", 6_900_000], [2, "Cập nhật thực đơn mùa thu", "m-04", "2026-10-05T10:00:00+07:00", 7_300_000]] },
  { id: "d-024", title: "Báo giá sự kiện HỶ GARDEN cuối năm", description: "Báo giá trọn gói tiệc tất niên doanh nghiệp: thực đơn, trang trí, âm thanh ánh sáng.", type: T.XLSX, category: C.QUOTATION, brand: "HỶ GARDEN", folderId: "f-garden", ownerId: "m-02", status: S.IN_REVIEW, visibility: V.TEAM, createdAt: "2026-10-26T10:00:00+07:00", updatedAt: "2026-11-01T10:30:00+07:00", sizeBytes: 98_000, tags: ["event", "pricing"],
    versions: [[1, "Bản nháp", "m-02", "2026-10-26T10:00:00+07:00", 91_000], [2, "Thêm gói 50 bàn", "m-02", "2026-11-01T10:30:00+07:00", 98_000]] },
  { id: "d-025", title: "Báo giá TASTING (bản cũ)", description: "Bản báo giá cũ đã thay thế bởi gói Q1/2027.", type: T.XLSX, category: C.QUOTATION, brand: "TASTING", folderId: "f-tasting", ownerId: "m-03", status: S.ARCHIVED, visibility: V.PRIVATE, createdAt: "2026-06-01T10:00:00+07:00", updatedAt: "2026-10-28T09:00:00+07:00", sizeBytes: 58_000, tags: ["pricing"], deletedAt: "2026-10-28T09:00:00+07:00",
    versions: [[1, "Bản nháp", "m-03", "2026-06-01T10:00:00+07:00", 58_000]] },
];

for (const doc of documents) {
  if (doc.versions.length === 0 && doc.type !== DocumentType.LINK) {
    doc.versions.push([1, "Phiên bản đầu tiên", doc.ownerId, doc.createdAt, doc.sizeBytes]);
  }
}

const previewKey = (doc: SeedDocument): string | null => {
  if (doc.type === DocumentType.PDF) return storageKey(doc, doc.versions.at(-1)?.[0] ?? 1);
  if (doc.type === DocumentType.PPTX) return `documents/${doc.id}/preview.pdf`;
  return null;
};

const storageKey = (doc: SeedDocument, version: number): string =>
  `documents/${doc.id}/v${version}.${EXT[doc.type]}`;

// Sao & chia sẻ nội bộ (khớp starred / sharedWithMe của CURRENT_USER m-01 ở mock)
const stars: Prisma.DocumentStarCreateManyInput[] = [
  ...["d-001", "d-002", "d-004", "d-007", "d-012"].map((documentId) => ({ memberId: "m-01", documentId })),
  { memberId: "m-02", documentId: "d-009" },
  { memberId: "m-04", documentId: "d-004" },
  { memberId: "m-05", documentId: "d-006" },
];

const accesses: Prisma.DocumentAccessCreateManyInput[] = [
  { documentId: "d-008", memberId: "m-01", permission: AccessPermission.EDIT },
  { documentId: "d-010", memberId: "m-01", permission: AccessPermission.VIEW },
  { documentId: "d-016", memberId: "m-01", permission: AccessPermission.EDIT },
  { documentId: "d-012", memberId: "m-07", permission: AccessPermission.VIEW },
  { documentId: "d-002", memberId: "m-07", permission: AccessPermission.VIEW },
  { documentId: "d-005", memberId: "m-06", permission: AccessPermission.VIEW },
  { documentId: "d-003", memberId: "m-02", permission: AccessPermission.EDIT },
];

const activities: Array<Omit<Prisma.ActivityLogCreateManyInput, "metadata"> & { metadata?: Prisma.InputJsonValue }> = [
  { id: "a-01", actorId: "m-02", action: ActivityAction.UPDATED, documentId: "d-002", targetType: "document", targetName: "Proposal hợp tác phim ngắn — TV360", createdAt: d("2026-11-02T08:30:00+07:00"), metadata: { version: 2 } },
  { id: "a-02", actorId: "m-01", action: ActivityAction.UPDATED, documentId: "d-001", targetType: "document", targetName: "Hồ sơ năng lực Triệu Hỷ Media 2026", createdAt: d("2026-11-01T16:20:00+07:00"), metadata: { version: 3 } },
  { id: "a-03", actorId: "m-03", action: ActivityAction.UPDATED, documentId: "d-019", targetType: "document", targetName: "Kế hoạch nội dung TikTok tháng 11", createdAt: d("2026-11-01T14:30:00+07:00") },
  { id: "a-04", actorId: "m-07", action: ActivityAction.DOWNLOADED, documentId: "d-012", targetType: "document", targetName: "Hợp đồng đồng sản xuất phim ngắn AI", createdAt: d("2026-11-01T10:12:00+07:00") },
  { id: "a-05", actorId: "m-01", action: ActivityAction.SHARED, documentId: "d-007", targetType: "share_link", targetName: "Portfolio dự án 2024–2026", createdAt: d("2026-10-31T17:00:00+07:00"), metadata: { token: "thm-portfolio" } },
  { id: "a-06", actorId: "m-02", action: ActivityAction.COMMENTED, documentId: "d-005", targetType: "document", targetName: "Hợp đồng dịch vụ truyền thông — TASTING", createdAt: d("2026-10-31T10:05:00+07:00") },
  { id: "a-07", actorId: "m-04", action: ActivityAction.CREATED, documentId: "d-004", targetType: "document", targetName: "HỶ GARDEN — Brand Guideline", createdAt: d("2026-10-30T15:10:00+07:00") },
  { id: "a-08", actorId: "m-01", action: ActivityAction.INVITED, documentId: null, targetType: "member", targetName: "thu.hoang@trieuhymedia.net", createdAt: d("2026-10-29T14:00:00+07:00"), metadata: { role: "VIEWER" } },
  { id: "a-09", actorId: "m-05", action: ActivityAction.RENAMED, documentId: "d-006", targetType: "document", targetName: "Coco Drama — Pitch Deck mùa 2", createdAt: d("2026-10-29T17:30:00+07:00"), metadata: { from: "Coco Drama — Pitch Deck S2" } },
  { id: "a-10", actorId: "m-03", action: ActivityAction.DELETED, documentId: "d-025", targetType: "document", targetName: "Báo giá TASTING (bản cũ)", createdAt: d("2026-10-28T09:00:00+07:00"), metadata: { soft: true } },
];

const COUNTRIES = ["VN", "VN", "VN", "SG", "CN", "US"] as const;
const USER_AGENTS = [
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0 Safari/537.36",
] as const;

async function main(): Promise<void> {
  // Xóa theo thứ tự phụ thuộc (con trước, cha sau)
  await prisma.$transaction([
    prisma.shareView.deleteMany(),
    prisma.shareLink.deleteMany(),
    prisma.activityLog.deleteMany(),
    prisma.documentAccess.deleteMany(),
    prisma.documentStar.deleteMany(),
    prisma.documentVersion.deleteMany(),
    prisma.document.deleteMany(),
    prisma.folder.updateMany({ data: { parentId: null } }),
    prisma.folder.deleteMany(),
    prisma.invitation.deleteMany(),
    prisma.member.deleteMany(),
    prisma.workspace.deleteMany(),
  ]);

  await prisma.workspace.create({
    data: {
      id: "ws-trieuhy",
      name: "Triệu Hỷ Media",
      companyInfo: "Công ty Triệu Hỷ Media — sản xuất nội dung, phim ngắn và truyền thông cho HỶ GARDEN, Coco Drama, TASTING.",
      logoUrl: null,
      accentColor: "#9B4148",
      publicFooter: "© 2026 Triệu Hỷ Media. Tài liệu chỉ dùng cho mục đích tham khảo của đối tác.",
    },
  });

  const devPassword = process.env.SEED_DEFAULT_PASSWORD;
  if (!devPassword) throw new Error("Thiếu SEED_DEFAULT_PASSWORD trong .env.local");
  const passwordHash = await bcrypt.hash(devPassword, 10);
  await prisma.member.createMany({
    data: members
      .filter((m) => DEMO || BASE_MEMBERS.includes(m.id as string))
      .map((m) => ({ ...m, passwordHash: m.status === MemberStatus.ACTIVE ? passwordHash : null })),
  });

  // Folder cha trước, folder con sau (FK self-relation)
  await prisma.folder.createMany({ data: folders.filter((f) => f.parentId === null) });
  if (!DEMO) {
    console.log("Seed xong (khung cơ bản). Đặt SEED_DEMO=1 để nạp dữ liệu mẫu.");
    return;
  }
  await prisma.folder.createMany({ data: folders.filter((f) => f.parentId !== null) });

  await prisma.invitation.create({
    data: {
      id: "inv-01",
      email: "thu.hoang@trieuhymedia.net",
      role: Role.VIEWER,
      invitedById: "m-01",
      token: "seed-invite-thu-hoang",
      expiresAt: d("2026-11-12T14:00:00+07:00"),
    },
  });

  await prisma.document.createMany({
    data: documents.map<Prisma.DocumentCreateManyInput>((doc) => {
      const latest = doc.versions.at(-1);
      return {
        id: doc.id,
        title: doc.title,
        description: doc.description,
        type: doc.type,
        category: doc.category,
        brand: doc.brand,
        status: doc.status,
        visibility: doc.visibility,
        folderId: doc.folderId,
        ownerId: doc.ownerId,
        fileUrl: latest ? storageKey(doc, latest[0]) : null,
        previewUrl: previewKey(doc),
        externalUrl: doc.externalUrl ?? null,
        sizeBytes: doc.type === DocumentType.LINK ? null : BigInt(doc.sizeBytes),
        mimeType: MIME[doc.type],
        pages: doc.pages ?? null,
        tags: doc.tags,
        createdAt: d(doc.createdAt),
        updatedAt: d(doc.updatedAt),
        deletedAt: doc.deletedAt ? d(doc.deletedAt) : null,
      };
    }),
  });

  await prisma.documentVersion.createMany({
    data: documents.flatMap((doc) =>
      doc.versions.map<Prisma.DocumentVersionCreateManyInput>(([version, note, authorId, createdAt, sizeBytes]) => ({
        documentId: doc.id,
        version,
        fileUrl: storageKey(doc, version),
        sizeBytes: BigInt(sizeBytes),
        note,
        createdById: authorId,
        createdAt: d(createdAt),
      })),
    ),
  });

  // Kho lưu trữ: làm mới thư mục documents/ rồi chép tệp mẫu theo từng phiên bản
  rmSync(path.join(STORAGE_DIR, "documents"), { recursive: true, force: true });
  for (const doc of documents) {
    const sample = SAMPLE_FILE[doc.type];
    for (const [version] of doc.versions) {
      if (sample) putSample(sample, storageKey(doc, version));
      else if (doc.type === DocumentType.PPTX) putSample(SAMPLE_FILE.PDF as string, storageKey(doc, version));
    }
    const preview = previewKey(doc);
    if (doc.type === DocumentType.PPTX && preview) putSample(SAMPLE_FILE.PDF as string, preview);
  }

  await prisma.documentStar.createMany({ data: stars });
  await prisma.documentAccess.createMany({ data: accesses });

  // Share link: token khớp shareToken ở mock; allowDownload xen kẽ như shareSettings ở mock
  const shared = documents.filter((doc): doc is SeedDocument & { shareToken: string } => Boolean(doc.shareToken));
  for (const [i, doc] of shared.entries()) {
    const viewCount = 12 + i * 7;
    await prisma.shareLink.create({
      data: {
        id: `sl-${doc.id}`,
        documentId: doc.id,
        token: doc.shareToken,
        allowDownload: i % 2 === 0,
        isActive: true,
        expiresAt: null,
        createdById: doc.ownerId,
        createdAt: d(doc.updatedAt),
        views: {
          createMany: {
            data: Array.from({ length: viewCount }, (_, k) => ({
              viewedAt: new Date(d(doc.updatedAt).getTime() + (k + 1) * 3_600_000 * 5),
              country: COUNTRIES[k % COUNTRIES.length],
              userAgent: USER_AGENTS[k % USER_AGENTS.length],
            })),
          },
        },
      },
    });
  }

  await prisma.activityLog.createMany({
    data: activities.map((a) => ({ ...a, metadata: a.metadata ?? {} })),
  });

  const [memberCount, folderCount, documentCount, versionCount, shareCount, viewCount] = await Promise.all([
    prisma.member.count(),
    prisma.folder.count(),
    prisma.document.count(),
    prisma.documentVersion.count(),
    prisma.shareLink.count(),
    prisma.shareView.count(),
  ]);
  console.log(
    `Seed xong: ${memberCount} thành viên, ${folderCount} thư mục, ${documentCount} tài liệu, ` +
      `${versionCount} phiên bản, ${shareCount} share link, ${viewCount} lượt xem.`,
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
