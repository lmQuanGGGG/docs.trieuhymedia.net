import {
  BookOpenText,
  Briefcase,
  FileSignature,
  type LucideIcon,
  Palette,
  Presentation,
  ReceiptText,
  ScrollText,
} from "lucide-react";
import type { CategorySlug } from "@/types";

export interface CategoryMeta {
  slug: CategorySlug;
  icon: LucideIcon;
  /** Màu chủ đạo của danh mục, dùng cho tile 3D và glow */
  color: string;
}

export const categories: CategoryMeta[] = [
  { slug: "proposals", icon: ScrollText, color: "#9B4148" },
  { slug: "company-profiles", icon: BookOpenText, color: "#3F6E6A" },
  { slug: "quotations", icon: ReceiptText, color: "#B7791F" },
  { slug: "contracts", icon: FileSignature, color: "#52525B" },
  { slug: "presentations", icon: Presentation, color: "#C2603A" },
  { slug: "portfolios", icon: Briefcase, color: "#6B7A3A" },
  { slug: "brand-assets", icon: Palette, color: "#B4536A" },
];

export const categoryMap = Object.fromEntries(
  categories.map((c) => [c.slug, c]),
) as Record<CategorySlug, CategoryMeta>;

export function isCategorySlug(value: string): value is CategorySlug {
  return value in categoryMap;
}
