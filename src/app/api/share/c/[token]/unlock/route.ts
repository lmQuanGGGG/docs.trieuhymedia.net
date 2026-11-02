import { cookies } from "next/headers";
import { handle, ok } from "@/server/http";
import { collectionCookieName, unlockCollection } from "@/server/services/collections";
import { unlockBody } from "@/server/validation";

export const POST = handle(async (req: Request, ctx: RouteContext<"/api/share/c/[token]/unlock">) => {
  const { token } = await ctx.params;
  const jwt = await unlockCollection(token, unlockBody.parse(await req.json()).password);
  (await cookies()).set(collectionCookieName(token), jwt, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return ok({ ok: true });
});
