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
    club: {
      findMany: mockFindMany,
    },
  },
}));

import { GET } from "./route";

function createRequest(token?: string): NextRequest {
  const headers: Record<string, string> = {};
  if (token) headers["authorization"] = `Bearer ${token}`;

  return new NextRequest("http://localhost/api/clubs", {
    method: "GET",
    headers,
  });
}

const mockClubs = [
  {
    id: "club-1",
    name: "Manchester United",
    ticker: "MANU",
    exchange: "NYSE",
    crestUrl: "/crests/manu.png",
    colorConfig: { primary: "#DA291C", secondary: "#FBE122" },
    isActive: true,
    prices: [{ price: 16.2, changePct: -1.1, updatedAt: new Date() }],
  },
  {
    id: "club-2",
    name: "FC Copenhagen",
    ticker: "PARKEN.CO",
    exchange: "Copenhagen SE",
    crestUrl: "/crests/copenhagen.png",
    colorConfig: { primary: "#006AB5", secondary: "#FFFFFF" },
    isActive: true,
    prices: [{ price: 18.5, changePct: -0.2, updatedAt: new Date() }],
  },
  {
    id: "club-3",
    name: "Juventus FC",
    ticker: "JUVE.MI",
    exchange: "Borsa Italiana",
    crestUrl: "/crests/juve.png",
    colorConfig: { primary: "#000000", secondary: "#FFFFFF" },
    isActive: true,
    prices: [{ price: 0.32, changePct: 1.2, updatedAt: new Date() }],
  },
];

describe("GET /api/clubs", () => {
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

  it("returns clubs with latest prices on success", async () => {
    mockVerifyAuth.mockResolvedValue({ userId: "did:privy:abc123" });
    mockFindMany.mockResolvedValue(mockClubs);

    const req = createRequest("valid-token");
    const response = await GET(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(3);
    // Sorted by price desc: Copenhagen (18.5) > Man United (16.2) > Juventus (0.32)
    expect(body.data[0]).toMatchObject({
      id: "club-2",
      name: "FC Copenhagen",
      ticker: "PARKEN.CO",
      price: 18.5,
      changePct: -0.2,
    });
  });

  it("returns clubs sorted by price descending", async () => {
    mockVerifyAuth.mockResolvedValue({ userId: "did:privy:abc123" });
    mockFindMany.mockResolvedValue(mockClubs);

    const req = createRequest("valid-token");
    const response = await GET(req);
    const body = await response.json();

    expect(body.data[0].price).toBe(18.5); // Copenhagen
    expect(body.data[1].price).toBe(16.2); // Man United
    expect(body.data[2].price).toBe(0.32); // Juventus
  });

  it("returns empty array when no active clubs", async () => {
    mockVerifyAuth.mockResolvedValue({ userId: "did:privy:abc123" });
    mockFindMany.mockResolvedValue([]);

    const req = createRequest("valid-token");
    const response = await GET(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual([]);
  });

  it("handles clubs with no prices (defaults to 0)", async () => {
    mockVerifyAuth.mockResolvedValue({ userId: "did:privy:abc123" });
    mockFindMany.mockResolvedValue([
      {
        id: "club-no-price",
        name: "No Price Club",
        ticker: "NPC",
        exchange: "TEST",
        crestUrl: "/crests/npc.png",
        colorConfig: { primary: "#000", secondary: "#FFF" },
        isActive: true,
        prices: [],
      },
    ]);

    const req = createRequest("valid-token");
    const response = await GET(req);
    const body = await response.json();

    expect(body.data[0].price).toBe(0);
    expect(body.data[0].changePct).toBe(0);
  });

  it("response matches ApiResponse shape", async () => {
    mockVerifyAuth.mockResolvedValue({ userId: "did:privy:abc123" });
    mockFindMany.mockResolvedValue(mockClubs);

    const req = createRequest("valid-token");
    const response = await GET(req);
    const body = await response.json();

    expect(body).toHaveProperty("success", true);
    expect(body).toHaveProperty("data");
    expect(Array.isArray(body.data)).toBe(true);

    const club = body.data[0];
    expect(club).toHaveProperty("id");
    expect(club).toHaveProperty("name");
    expect(club).toHaveProperty("ticker");
    expect(club).toHaveProperty("exchange");
    expect(club).toHaveProperty("crestUrl");
    expect(club).toHaveProperty("colorConfig");
    expect(club).toHaveProperty("price");
    expect(club).toHaveProperty("changePct");
  });
});
