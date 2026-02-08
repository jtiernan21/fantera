import { describe, it, expect } from "vitest";
import { apiSuccess, apiError } from "./api-response";

describe("apiSuccess", () => {
  it("returns correct JSON shape with success: true", async () => {
    const response = apiSuccess({ id: "123", name: "Test" });
    const body = await response.json();

    expect(body).toEqual({
      success: true,
      data: { id: "123", name: "Test" },
    });
    expect(response.status).toBe(200);
  });

  it("passes through custom status code", async () => {
    const response = apiSuccess({ created: true }, 201);
    const body = await response.json();

    expect(body.success).toBe(true);
    expect(response.status).toBe(201);
  });
});

describe("apiError", () => {
  it("returns correct JSON shape with success: false and error details", async () => {
    const response = apiError(
      "AUTH_FAILED",
      "Authentication required",
      "SYSTEM_ERROR",
      401
    );
    const body = await response.json();

    expect(body).toEqual({
      success: false,
      error: {
        code: "AUTH_FAILED",
        message: "Authentication required",
        type: "SYSTEM_ERROR",
      },
    });
    expect(response.status).toBe(401);
  });

  it("uses default 500 status when not specified", async () => {
    const response = apiError(
      "INTERNAL",
      "Something went wrong",
      "SYSTEM_ERROR"
    );

    expect(response.status).toBe(500);
  });
});
