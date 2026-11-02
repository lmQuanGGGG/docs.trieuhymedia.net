import "server-only";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export type ApiErrorCode = "unauthorized" | "forbidden" | "not_found" | "bad_request" | "conflict";

const STATUS: Record<ApiErrorCode, number> = {
  unauthorized: 401,
  forbidden: 403,
  not_found: 404,
  bad_request: 400,
  conflict: 409,
};

export class ApiError extends Error {
  constructor(
    readonly code: ApiErrorCode,
    message?: string,
  ) {
    super(message ?? code);
  }
}

/** Bọc route handler: chuyển lỗi nghiệp vụ thành JSON có mã lỗi rõ ràng */
export function handle<A extends unknown[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof ApiError) {
        return NextResponse.json({ error: error.code, message: error.message }, { status: STATUS[error.code] });
      }
      if (error instanceof ZodError) {
        return NextResponse.json({ error: "bad_request", issues: error.issues }, { status: 400 });
      }
      console.error(error);
      return NextResponse.json({ error: "server_error" }, { status: 500 });
    }
  };
}

export const ok = <T>(data: T, init?: ResponseInit) => NextResponse.json(data, init);
