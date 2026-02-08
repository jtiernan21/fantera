import { NextResponse } from "next/server";

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(
  code: string,
  message: string,
  type:
    | "UNAUTHORIZED"
    | "VALIDATION_ERROR"
    | "NOT_FOUND"
    | "INSUFFICIENT_LIQUIDITY"
    | "PAYMENT_FAILED"
    | "PRICE_MOVED"
    | "SYSTEM_ERROR",
  status = 500
) {
  return NextResponse.json(
    { success: false, error: { code, message, type } },
    { status }
  );
}
