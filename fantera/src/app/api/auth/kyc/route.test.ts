import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { mockVerifyAuth, mockInitiateKyc, mockGetKycStatus, mockMapPrivyKycStatus } =
  vi.hoisted(() => ({
    mockVerifyAuth: vi.fn(),
    mockInitiateKyc: vi.fn(),
    mockGetKycStatus: vi.fn(),
    mockMapPrivyKycStatus: vi.fn(),
  }));

const { mockFindUnique, mockUpdate } = vi.hoisted(() => ({
  mockFindUnique: vi.fn(),
  mockUpdate: vi.fn(),
}));

vi.mock("@/lib/privy", () => ({
  verifyAuth: mockVerifyAuth,
  initiateKyc: mockInitiateKyc,
  getKycStatus: mockGetKycStatus,
  mapPrivyKycStatus: mockMapPrivyKycStatus,
  privyClient: {},
}));

vi.mock("@/generated/prisma/client", () => ({
  PrismaClient: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: mockFindUnique,
      update: mockUpdate,
    },
  },
}));

import { POST, GET } from "./route";

function createRequest(
  method: string,
  body?: object,
  token?: string
): NextRequest {
  const headers: Record<string, string> = {};
  if (token) headers["authorization"] = `Bearer ${token}`;
  if (body) headers["content-type"] = "application/json";

  return new NextRequest("http://localhost/api/auth/kyc", {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers,
  });
}

const validKycBody = {
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  dateOfBirth: "1990-01-15",
  streetAddress: "123 Main St",
  city: "New York",
  state: "NY",
  postalCode: "10001",
  country: "USA",
};

describe("POST /api/auth/kyc", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockVerifyAuth.mockResolvedValue(null);

    const req = createRequest("POST", validKycBody);
    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.success).toBe(false);
  });

  it("returns 400 on invalid body (Zod validation)", async () => {
    mockVerifyAuth.mockResolvedValue({ userId: "did:privy:abc123" });
    mockFindUnique.mockResolvedValue({
      id: "user-1",
      privyId: "did:privy:abc123",
    });

    const req = createRequest("POST", { firstName: "" }, "valid-token");
    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
  });

  it("initiates KYC and returns UNDER_REVIEW on success", async () => {
    mockVerifyAuth.mockResolvedValue({ userId: "did:privy:abc123" });
    mockFindUnique.mockResolvedValue({
      id: "user-1",
      privyId: "did:privy:abc123",
      kycStatus: "NOT_STARTED",
    });
    mockInitiateKyc.mockResolvedValue({
      status: "under_review",
      provider_user_id: "bridge-123",
    });
    mockUpdate.mockResolvedValue({});

    const req = createRequest("POST", validKycBody, "valid-token");
    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.kycStatus).toBe("UNDER_REVIEW");
    expect(mockInitiateKyc).toHaveBeenCalledWith(
      "did:privy:abc123",
      validKycBody
    );
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { privyId: "did:privy:abc123" },
      data: {
        kycStatus: "UNDER_REVIEW",
        kycProviderUserId: "bridge-123",
      },
    });
  });

  it("returns 400 if user is already ACTIVE", async () => {
    mockVerifyAuth.mockResolvedValue({ userId: "did:privy:abc123" });
    mockFindUnique.mockResolvedValue({
      id: "user-1",
      privyId: "did:privy:abc123",
      kycStatus: "ACTIVE",
    });

    const req = createRequest("POST", validKycBody, "valid-token");
    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(mockInitiateKyc).not.toHaveBeenCalled();
  });

  it("returns 500 if Privy API fails", async () => {
    mockVerifyAuth.mockResolvedValue({ userId: "did:privy:abc123" });
    mockFindUnique.mockResolvedValue({
      id: "user-1",
      privyId: "did:privy:abc123",
    });
    mockInitiateKyc.mockRejectedValue(new Error("Privy API down"));

    const req = createRequest("POST", validKycBody, "valid-token");
    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.success).toBe(false);
  });
});

describe("GET /api/auth/kyc", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockVerifyAuth.mockResolvedValue(null);

    const req = createRequest("GET");
    const response = await GET(req);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.success).toBe(false);
  });

  it("returns current KYC status from database for ACTIVE users", async () => {
    mockVerifyAuth.mockResolvedValue({ userId: "did:privy:abc123" });
    mockFindUnique.mockResolvedValue({
      id: "user-1",
      privyId: "did:privy:abc123",
      kycStatus: "ACTIVE",
    });

    const req = createRequest("GET", undefined, "valid-token");
    const response = await GET(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.kycStatus).toBe("ACTIVE");
    expect(mockGetKycStatus).not.toHaveBeenCalled();
  });

  it("checks Privy API and syncs status for in-progress users", async () => {
    mockVerifyAuth.mockResolvedValue({ userId: "did:privy:abc123" });
    mockFindUnique.mockResolvedValue({
      id: "user-1",
      privyId: "did:privy:abc123",
      kycStatus: "UNDER_REVIEW",
      kycProviderUserId: "bridge-123",
    });
    mockGetKycStatus.mockResolvedValue({
      status: "active",
      providerUserId: "bridge-123",
    });
    mockMapPrivyKycStatus.mockReturnValue("ACTIVE");
    mockUpdate.mockResolvedValue({});

    const req = createRequest("GET", undefined, "valid-token");
    const response = await GET(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.kycStatus).toBe("ACTIVE");
    expect(mockGetKycStatus).toHaveBeenCalledWith("did:privy:abc123");
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { privyId: "did:privy:abc123" },
      data: {
        kycStatus: "ACTIVE",
        kycProviderUserId: "bridge-123",
      },
    });
  });
});
