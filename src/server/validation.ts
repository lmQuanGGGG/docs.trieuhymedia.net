import "server-only";
import { z } from "zod";
import { brands, categorySlugs, documentTypes, roles, visibilities } from "@/types";

export const loginBody = z.object({ email: z.email(), password: z.string().min(1).max(200) });
export const idsBody = z.object({ ids: z.array(z.string().min(1)).min(1).max(200) });
export const starBody = idsBody.extend({ starred: z.boolean() });
export const titleField = z.string().trim().min(3).max(120);
export const updateDocumentBody = z
  .object({ title: titleField.optional(), visibility: z.enum(visibilities).optional() })
  .refine((v) => v.title !== undefined || v.visibility !== undefined);
export const createDocumentFields = z.object({
  title: titleField,
  category: z.enum(categorySlugs),
  brand: z.enum(brands),
  visibility: z.enum(visibilities),
  type: z.enum(documentTypes).optional(),
  url: z.url().optional(),
  folderId: z.string().optional(),
});
export const folderBody = z.object({ name: z.string().trim().min(2).max(60), brand: z.enum(brands) });
export const PASSWORD_MIN = 8;
const password = z.string().min(PASSWORD_MIN).max(100);
export const createMemberBody = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email(),
  role: z.enum(roles),
  title: z.string().trim().max(80).optional(),
  password,
});
export const resetPasswordBody = z.object({ password });
export const changePasswordBody = z.object({ currentPassword: z.string().min(1).max(100), newPassword: password });
export const roleBody = z.object({ role: z.enum(roles) });
export const shareBody = z.object({
  isActive: z.boolean(),
  allowDownload: z.boolean(),
  password: z.string().max(100).optional(),
  expiresAt: z.iso.datetime({ offset: true }).nullable(),
  renew: z.boolean().optional(),
});
export const unlockBody = z.object({ password: z.string().min(1).max(100) });
