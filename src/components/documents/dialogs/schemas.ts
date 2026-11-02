import { z } from "zod";
import { brands, categorySlugs, documentTypes, visibilities } from "@/types";

export const TITLE_MIN = 3;
export const TITLE_MAX = 120;
export const MAX_FILE_BYTES = 2 * 1024 * 1024 * 1024;

type Translate = (key: "required" | "titleMin" | "titleMax" | "fileRequired" | "fileTooLarge" | "url" | "nameMin", values?: Record<string, number>) => string;

export function titleSchema(t: Translate) {
  return z
    .string()
    .trim()
    .min(1, t("required"))
    .min(TITLE_MIN, t("titleMin", { min: TITLE_MIN }))
    .max(TITLE_MAX, t("titleMax", { max: TITLE_MAX }));
}

export function documentMetaSchema(t: Translate) {
  return z.object({
    title: titleSchema(t),
    category: z.enum(categorySlugs),
    brand: z.enum(brands),
    visibility: z.enum(visibilities),
  });
}

export function uploadSchema(t: Translate) {
  return documentMetaSchema(t).extend({
    file: z
      .custom<File | null>()
      .refine((f): f is File => f instanceof File, t("fileRequired"))
      .refine((f) => !(f instanceof File) || f.size <= MAX_FILE_BYTES, t("fileTooLarge")),
  });
}

export function newDocumentSchema(t: Translate) {
  return documentMetaSchema(t)
    .extend({
      type: z.enum(documentTypes),
      url: z.string().trim(),
    })
    .superRefine((v, ctx) => {
      if (v.type !== "link") return;
      if (!z.url().safeParse(v.url).success) {
        ctx.addIssue({ code: "custom", path: ["url"], message: t("url") });
      }
    });
}

export function folderSchema(t: Translate) {
  return z.object({
    name: z.string().trim().min(2, t("nameMin", { min: 2 })).max(60, t("titleMax", { max: 60 })),
    brand: z.enum(brands),
  });
}
