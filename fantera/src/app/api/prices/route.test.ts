import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { mockVerifyAuth } = vi.hoisted(() => ({
  mockVerifyAuth: vi.fn(),
}));

const { mockFindMany } = vi.hoisted(() => ({
  mockFindMany: vi.fn(),
}));

vi.mock("@/lib/privy", () => ({
  verifyAuth: mockVerifyAuth,
  privyClient: {},
}));

vi.mock("@/generated/prisma/client", () => ({
  PrismaClient: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    price: {
      findMany: mockFindMany,
    },
  },
}));

import { GET } from "./route";

function createRequest(token?: string): NextRequest {
  const headers: Record<string, string> = {};
  if (token) headers["authorization"] = `Bearer ${token}`;

  return new NextRequest("http://localhost/api/prices", {
    method: "GET",
    headers,
  });
}

const mockPrices = [
  {
    id: "price-1",
    clubId: "club-1",
    price: 16.2,
    changePct: -1.1,
    updatedAt: new Date("2026-02-08T03:00:00Z"),
    club: { id: "club-1", ticker: "MANU" },
  },
  {
    id: "price-2",
    clubId: "club-2",
    price: 0.32,
    changePct: 1.2,
    updatedAt: new Date("2026-02-08T03:00:00Z"),
    club: { id: "club-2", ticker: "JUVE.MI" },
  },
];

describe("GET /api/prices", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockVerifyAuth.mockResolvedValue(null);

    const req = createRequest();
    const response = await GET(req);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("UNAUTHORIZED");
  });

  it("returns all latest prices in correct shape", async () => {
    mockVerifyAuth.mockResolvedValue({ userId: "did:privy:abc123" });
    mockFindMany.mockResolvedValue(mockPrices);

    const req = createRequest("valid-token");
    const response = await GET(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(2);
    expect(body.data[0]).toMatchObject({
      clubId: "club-1",
      ticker: "MANU",
      price: 16.2,
      changePct: -1.1,
    });
  });

  it("response includes updatedAt field for each price", async () => {
    mockVerifyAuth.mockResolvedValue({ userId: "did:privy:abc123" });
    mockFindMany.mockResolvedValue(mockPrices);

    const req = createRequest("valid-token");
    const response = await GET(req);
    const body = await response.json();

    for (const price of body.data) {
      expect(price).toHaveProperty("updatedAt");
      expect(typeof price.updatedAt).toBe("string");
    }
  });

  it("response follows ApiResponse shape", async () => {
    mockVerifyAuth.mockResolvedValue({ userId: "did:privy:abc123" });
    mockFindMany.mockResolvedValue(mockPrices);

    const req = createRequest("valid-token");
    const response = await GET(req);
    const body = await response.json();

    expect(body).toHaveProperty("success", true);
    expect(body).toHaveProperty("data");
    expect(Array.isArray(body.data)).toBe(true);
  });
});
