import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { readSession, SESSION_COOKIE } from "./lib/session-token";
import { routing } from "./i18n/routing";

const intl = createMiddleware(routing);

/** Các trang không cần đăng nhập (sau tiền tố locale) */
const PUBLIC_PATHS = [/^\/login\/?$/, /^\/share\//];

function stripLocale(pathname: string): { locale: string; rest: string } | null {
  const match = pathname.match(/^\/(vi|en|zh-CN)(\/.*)?$/);
  return match ? { locale: match[1], rest: match[2] ?? "/" } : null;
}

export default async function proxy(request: NextRequest) {
  const parsed = stripLocale(request.nextUrl.pathname);
  if (parsed && !PUBLIC_PATHS.some((re) => re.test(parsed.rest))) {
    const secret = process.env.AUTH_SECRET;
    // Kiểm tra nhanh chữ ký JWT; server vẫn kiểm tra lại trạng thái thành viên ở mỗi API
    const session = secret ? await readSession(request.cookies.get(SESSION_COOKIE)?.value, new TextEncoder().encode(secret)) : null;
    if (!session) {
      const url = request.nextUrl.clone();
      url.pathname = `/${parsed.locale}/login`;
      url.search = parsed.rest === "/" ? "" : `?next=${encodeURIComponent(parsed.rest)}`;
      return NextResponse.redirect(url);
    }
  }
  return intl(request);
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
