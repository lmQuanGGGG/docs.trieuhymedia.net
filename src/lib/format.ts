const UNITS = ["B", "KB", "MB", "GB"] as const;

export function formatBytes(bytes: number, locale: string): string {
  if (bytes <= 0) return "—";
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const formatted = new Intl.NumberFormat(locale, {
    maximumFractionDigits: value < 10 && unit > 0 ? 1 : 0,
  }).format(value);
  return `${formatted} ${UNITS[unit]}`;
}
