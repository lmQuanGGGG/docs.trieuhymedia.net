import { cookies } from "next/headers";
import { handle, ok } from "@/server/http";
import { shareCookieName, unlockShare } from "@/server/services/share";
import { unlockBody } from "@/server/validation";

export const POST = handle(async (req: Request, ctx: RouteContext<"/api/share/[token]/unlock">) => {
  const { token } = await ctx.params;
  const jwt = await unlockShare(token, unlockBody.parse(await req.json()).password);
  (await cookies()).set(shareCookieName(token), jwt, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return ok({ ok: true });
});
