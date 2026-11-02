import { LayoutGrid } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { CSSProperties, ReactNode } from "react";
import { categories } from "@/config/categories";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import type { CategorySlug, DocumentItem } from "@/types";

/** Danh mục có tài liệu trong bộ, theo thứ tự chuẩn của portal */
export function collectionCategories(documents: DocumentItem[]) {
  return categories
    .map((c) => ({ ...c, count: documents.filter((d) => d.category === c.slug).length }))
    .filter((c) => c.count > 0);
}

/**
 * Khung trang bộ chia sẻ: thanh bên danh mục (desktop) / hàng chip (mobile)
 * giống portal nội bộ, để đối tác duyệt tài liệu theo danh mục.
 */
export async function CollectionFrame({
  locale,
  token,
  documents,
  active,
  children,
}: {
  locale: Locale;
  token: string;
  documents: DocumentItem[];
  /** "all" hoặc slug danh mục đang chọn */
  active: CategorySlug | "all";
  children: ReactNode;
}) {
  const t = await getTranslations({ locale });
  const cats = collectionCategories(documents);
  const base = `/share/c/${token}`;
  const items = [
    { key: "all" as const, href: base, label: t("publicCollection.all"), count: documents.length, color: undefined, icon: LayoutGrid },
    ...cats.map((c) => ({ key: c.slug, href: `${base}?cat=${c.slug}`, label: t(`categories.${c.slug}.name`), count: c.count, color: c.color, icon: c.icon })),
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-8">
      <nav aria-label={t("publicCollection.categories")} className="min-w-0 lg:sticky lg:top-20 lg:self-start">
        <p className="mb-2 hidden px-3 text-[11px] font-medium tracking-wide text-muted-foreground uppercase lg:block">
          {t("publicCollection.categories")}
        </p>
        <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none lg:mx-0 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-0">
          {items.map((it) => {
            const on = active === it.key;
            return (
              <li key={it.key} className="shrink-0">
                <Link
                  href={it.href}
                  aria-current={on ? "page" : undefined}
                  style={it.color ? ({ "--dot": it.color } as CSSProperties) : undefined}
                  className={cn(
                    "flex items-center gap-2.5 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:rounded-lg lg:py-2",
                    "bg-muted/60 lg:bg-transparent",
                    on && "bg-card text-foreground shadow-soft lg:bg-card",
                  )}
                >
                  <it.icon className={cn("size-4 shrink-0", it.color ? "text-[var(--dot)]" : on && "text-brand")} strokeWidth={1.9} />
                  <span className="truncate">{it.label}</span>
                  <span className="ml-auto pl-1 text-xs tabular-nums text-muted-foreground">{it.count}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
