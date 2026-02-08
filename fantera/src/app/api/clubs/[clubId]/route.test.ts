import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { mockVerifyAuth, mockFindUnique, mockGetClubMetadata } = vi.hoisted(
  () => ({
    mockVerifyAuth: vi.fn(),
    mockFindUnique: vi.fn(),
    mockGetClubMetadata: vi.fn(),
  })
);

vi.mock("@/lib/privy", () => ({
  verifyAuth: mockVerifyAuth,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    club: {
      findUnique: mockFindUnique,
    },
  },
}));

vi.mock("@/config/club-metadata", () => ({
  getClubMetadata: mockGetClubMetadata,
}));

import { GET } from "./route";

function createRequest(url = "http://localhost/api/clubs/club-1") {
  return new NextRequest(url, {
    headers: { Authorization: "Bearer test-token" },
  });
}

function createParams(clubId: string) {
  return { params: Promise.resolve({ clubId }) };
}

describe("GET /api/clubs/[clubId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetClubMetadata.mockReturnValue({
      country: "Italy",
      league: "Serie A",
      marketContext: "Test market context",
    });
  });

  it("returns 401 when unauthenticated", async () => {
    mockVerifyAuth.mockResolvedValue(null);

    const res = await GET(createRequest(), createParams("club-1"));
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("UNAUTHORIZED");
  });

  it("returns 404 for non-existent club", async () => {
    mockVerifyAuth.mockResolvedValue({ userId: "user-1" });
    mockFindUnique.mockResolvedValue(null);

    const res = await GET(createRequest(), createParams("nonexistent"));
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("NOT_FOUND");
  });

  it("returns 404 for inactive club", async () => {
    mockVerifyAuth.mockResolvedValue({ userId: "user-1" });
    mockFindUnique.mockResolvedValue({
      id: "club-1",
      name: "Juventus",
      ticker: "JUVE.MI",
      exchange: "Borsa Italiana",
      crestUrl: "/crests/juve.png",
      colorConfig: { primary: "#000000" },
      isActive: false,
      prices: [],
    });

    const res = await GET(createRequest(), createParams("club-1"));
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("NOT_FOUND");
  });

  it("returns club detail with latest price on success", async () => {
    mockVerifyAuth.mockResolvedValue({ userId: "user-1" });
    mockFindUnique.mockResolvedValue({
      id: "club-1",
      name: "Juventus",
      ticker: "JUVE.MI",
      exchange: "Borsa Italiana",
      crestUrl: "/crests/juve.png",
      colorConfig: { primary: "#000000", secondary: "#FFFFFF" },
      isActive: true,
      prices: [{ price: 0.32, changePct: 2.5, updatedAt: new Date() }],
    });

    const res = await GET(createRequest(), createParams("club-1"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.id).toBe("club-1");
    expect(body.data.name).toBe("Juventus");
    expect(body.data.ticker).toBe("JUVE.MI");
    expect(body.data.price).toBe(0.32);
    expect(body.data.changePct).toBe(2.5);
  });

  it("response includes about object with country, league, marketContext", async () => {
    mockVerifyAuth.mockResolvedValue({ userId: "user-1" });
    mockFindUnique.mockResolvedValue({
      id: "club-1",
      name: "Juventus",
      ticker: "JUVE.MI",
      exchange: "Borsa Italiana",
      crestUrl: "/crests/juve.png",
      colorConfig: { primary: "#000000" },
      isActive: true,
      prices: [{ price: 0.32, changePct: 2.5, updatedAt: new Date() }],
    });

    const res = await GET(createRequest(), createParams("club-1"));
    const body = await res.json();

    expect(body.data.about).toBeDefined();
    expect(body.data.about.country).toBe("Italy");
    expect(body.data.about.league).toBe("Serie A");
    expect(body.data.about.marketContext).toBe("Test market context");
    expect(mockGetClubMetadata).toHaveBeenCalledWith("JUVE.MI");
  });

  it("response matches ApiResponse shape", async () => {
    mockVerifyAuth.mockResolvedValue({ userId: "user-1" });
    mockFindUnique.mockResolvedValue({
      id: "club-1",
      name: "Juventus",
      ticker: "JUVE.MI",
      exchange: "Borsa Italiana",
      crestUrl: "/crests/juve.png",
      colorConfig: { primary: "#000000" },
      isActive: true,
      prices: [{ price: 0.32, changePct: 1.0, updatedAt: new Date() }],
    });

    const res = await GET(createRequest(), createParams("club-1"));
    const body = await res.json();

    expect(body).toHaveProperty("success", true);
    expect(body).toHaveProperty("data");
    expect(body.data).toHaveProperty("id");
    expect(body.data).toHaveProperty("name");
    expect(body.data).toHaveProperty("ticker");
    expect(body.data).toHaveProperty("exchange");
    expect(body.data).toHaveProperty("crestUrl");
    expect(body.data).toHaveProperty("colorConfig");
    expect(body.data).toHaveProperty("price");
    expect(body.data).toHaveProperty("changePct");
    expect(body.data).toHaveProperty("about");
  });

  it("defaults price to 0 when no prices exist", async () => {
    mockVerifyAuth.mockResolvedValue({ userId: "user-1" });
    mockFindUnique.mockResolvedValue({
      id: "club-1",
      name: "Juventus",
      ticker: "JUVE.MI",
      exchange: "Borsa Italiana",
      crestUrl: "/crests/juve.png",
      colorConfig: { primary: "#000000" },
      isActive: true,
      prices: [],
    });

    const res = await GET(createRequest(), createParams("club-1"));
    const body = await res.json();

    expect(body.data.price).toBe(0);
    expect(body.data.changePct).toBe(0);
  });
});
