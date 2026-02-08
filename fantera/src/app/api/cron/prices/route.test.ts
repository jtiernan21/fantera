import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { mockGetPrices } = vi.hoisted(() => ({
  mockGetPrices: vi.fn(),
}));

const { mockFindMany, mockUpsert } = vi.hoisted(() => ({
  mockFindMany: vi.fn(),
  mockUpsert: vi.fn(),
}));

vi.mock("@/lib/alpaca", () => ({
  getPrices: mockGetPrices,
}));

vi.mock("@/generated/prisma/client", () => ({
  PrismaClient: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    club: {
      findMany: mockFindMany,
    },
    price: {
      upsert: mockUpsert,
    },
  },
}));

// Set CRON_SECRET for tests
vi.stubEnv("CRON_SECRET", "test-cron-secret");

import { GET } from "./route";

function createRequest(secret?: string): NextRequest {
  const headers: Record<string, string> = {};
  if (secret) headers["authorization"] = `Bearer ${secret}`;

  return new NextRequest("http://localhost/api/cron/prices", {
    method: "GET",
    headers,
  });
}

describe("GET /api/cron/prices", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 without Authorization header", async () => {
    const req = createRequest();
    const response = await GET(req);

    expect(response.status).toBe(401);
  });

  it("returns 401 with incorrect CRON_SECRET", async () => {
    const req = createRequest("wrong-secret");
    const response = await GET(req);

    expect(response.status).toBe(401);
  });

  it("returns 401 when CRON_SECRET env var is not set", async () => {
    vi.stubEnv("CRON_SECRET", "");

    const req = createRequest("Bearer undefined");
    const response = await GET(req);

    expect(response.status).toBe(401);

    // Restore for remaining tests
    vi.stubEnv("CRON_SECRET", "test-cron-secret");
  });

  it("successfully fetches prices and upserts to database", async () => {
    const clubs = [
      { id: "club-1", ticker: "MANU" },
      { id: "club-2", ticker: "JUVE.MI" },
    ];

    mockFindMany.mockResolvedValue(clubs);
    mockGetPrices.mockResolvedValue([
      { ticker: "MANU", price: 16.2, changePct: -1.1 },
      { ticker: "JUVE.MI", price: 0.32, changePct: 1.2 },
    ]);
    mockUpsert.mockResolvedValue({});

    const req = createRequest("test-cron-secret");
    const response = await GET(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.updated).toBe(2);
    expect(body.data.timestamp).toBeDefined();

    expect(mockUpsert).toHaveBeenCalledTimes(2);
    expect(mockGetPrices).toHaveBeenCalledWith(["MANU", "JUVE.MI"]);
  });

  it("returns success with updated: 0 for empty club list", async () => {
    mockFindMany.mockResolvedValue([]);

    const req = createRequest("test-cron-secret");
    const response = await GET(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.updated).toBe(0);
    expect(mockGetPrices).not.toHaveBeenCalled();
  });

  it("handles Alpaca API failure gracefully (returns 500)", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    mockFindMany.mockResolvedValue([{ id: "club-1", ticker: "MANU" }]);
    mockGetPrices.mockRejectedValue(new Error("Alpaca API unavailable"));

    const req = createRequest("test-cron-secret");
    const response = await GET(req);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("PRICE_FETCH_FAILED");
    expect(body.error.type).toBe("SYSTEM_ERROR");

    errorSpy.mockRestore();
  });
});
