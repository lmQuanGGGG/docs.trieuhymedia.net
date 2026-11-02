import type { DocumentItem } from "@/types";

/** Thêm tham số query vào URL tệp (giữ tham số sẵn có) */
export function withParam(url: string, key: string, value: string): string {
  return `${url}${url.includes("?") ? "&" : "?"}${key}=${encodeURIComponent(value)}`;
}

/** Các ngôn ngữ đang có của tài liệu: bản gốc trước, rồi các bản dịch */
export function availableLocales(doc: DocumentItem): string[] {
  return [doc.locale, ...doc.variants.map((v) => v.locale).filter((l) => l !== doc.locale)];
}

/**
 * Trả về "góc nhìn" của tài liệu theo ngôn ngữ: nếu có bản dịch thì đổi loại tệp
 * và URL sang bản đó (?lang=…), không thì giữ bản gốc.
 */
export function documentForLocale(doc: DocumentItem, lang: string): DocumentItem {
  if (lang === doc.locale) return doc;
  const v = doc.variants.find((x) => x.locale === lang);
  if (!v || !doc.fileUrl) return doc;
  const base = doc.fileUrl.split("?")[0];
  return {
    ...doc,
    type: v.type,
    sizeBytes: v.sizeBytes,
    fileUrl: withParam(base, "lang", lang),
    previewUrl: v.hasPreview ? withParam(withParam(base, "variant", "preview"), "lang", lang) : undefined,
  };
}

/** Ngôn ngữ mặc định khi mở: khớp giao diện nếu có bản đó, không thì bản gốc */
export function defaultLocaleFor(doc: DocumentItem, uiLocale: string): string {
  return availableLocales(doc).includes(uiLocale) ? uiLocale : doc.locale;
}
