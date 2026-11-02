import { cookies } from "next/headers";
import { fileResponse } from "@/server/file-response";
import { handle } from "@/server/http";
import { collectionCookieName, resolveCollectionFile } from "@/server/services/collections";

export const GET = handle(async (req: Request, ctx: RouteContext<"/api/share/c/[token]/file/[docId]">) => {
  const { token, docId } = await ctx.params;
  const url = new URL(req.url);
  const variant = url.searchParams.get("variant") === "preview" ? "preview" : "original";
  const download = url.searchParams.get("download") === "1";
  const cookie = (await cookies()).get(collectionCookieName(token))?.value;
  const file = await resolveCollectionFile(token, cookie, docId, variant, download, url.searchParams.get("lang"));
  return fileResponse(file.key, { title: file.title, mime: file.mime, download, range: req.headers.get("range") });
});
