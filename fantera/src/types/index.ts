export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};

export type ApiErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    type:
      | "UNAUTHORIZED"
      | "VALIDATION_ERROR"
      | "NOT_FOUND"
      | "INSUFFICIENT_LIQUIDITY"
      | "PAYMENT_FAILED"
      | "PRICE_MOVED"
      | "SYSTEM_ERROR";
  };
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
