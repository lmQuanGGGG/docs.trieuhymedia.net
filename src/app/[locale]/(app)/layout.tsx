import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getCurrentMember } from "@/server/auth/session";

export default async function AppLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  const me = await getCurrentMember();
  // Proxy chỉ kiểm chữ ký phiên; ở đây kiểm tra thêm trạng thái tài khoản trong DB
  if (!me) redirect(`/${locale}/login`);
  if (me.mustChangePassword) redirect(`/${locale}/account/password`);
  return <AppShell>{children}</AppShell>;
}
