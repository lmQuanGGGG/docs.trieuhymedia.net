/** Thêm ?download=1 để server trả về dạng tệp đính kèm và ghi nhật ký tải xuống */
export function downloadHref(url: string): string {
  return `${url}${url.includes("?") ? "&" : "?"}download=1`;
}
