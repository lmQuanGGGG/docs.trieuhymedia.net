import { cookies } from "next/headers";
import { fileResponse } from "@/server/file-response";
import { handle } from "@/server/http";
import { resolvePublicFile, shareCookieName } from "@/server/services/share";

export const GET = handle(async (req: Request, ctx: RouteContext<"/api/share/[token]/file">) => {
  const { token } = await ctx.params;
  const url = new URL(req.url);
  const variant = url.searchParams.get("variant") === "preview" ? "preview" : "original";
  const download = url.searchParams.get("download") === "1";
  const unlock = (await cookies()).get(shareCookieName(token))?.value;
  const file = await resolvePublicFile(token, unlock, variant, download, url.searchParams.get("lang"));
  return fileResponse(file.key, { title: file.title, mime: file.mime, download, range: req.headers.get("range") });
});
