import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockVerifyAuthToken, mockFetch } = vi.hoisted(() => ({
  mockVerifyAuthToken: vi.fn(),
  mockFetch: vi.fn(),
}));

vi.mock("@privy-io/server-auth", () => ({
  PrivyClient: class MockPrivyClient {
    verifyAuthToken = mockVerifyAuthToken;
  },
}));

vi.stubGlobal("fetch", mockFetch);

import { verifyAuth, initiateKyc, getKycStatus, mapPrivyKycStatus } from "./privy";

describe("verifyAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("PRIVY_APP_ID", "test-app-id");
    vi.stubEnv("PRIVY_APP_SECRET", "test-app-secret");
    vi.stubEnv("PRIVY_KYC_PROVIDER", "bridge-sandbox");
  });

  it("returns { userId } when valid Bearer token is provided", async () => {
    mockVerifyAuthToken.mockResolvedValue({ userId: "did:privy:abc123" });

    const request = new Request("http://localhost/api/test", {
      headers: { Authorization: "Bearer valid-token" },
    });

    const result = await verifyAuth(request);
    expect(result).toEqual({ userId: "did:privy:abc123" });
    expect(mockVerifyAuthToken).toHaveBeenCalledWith("valid-token");
  });

  it("returns null when no Authorization header", async () => {
    const request = new Request("http://localhost/api/test");

    const result = await verifyAuth(request);
    expect(result).toBeNull();
    expect(mockVerifyAuthToken).not.toHaveBeenCalled();
  });

  it('returns null when Authorization header does not start with "Bearer "', async () => {
    const request = new Request("http://localhost/api/test", {
      headers: { Authorization: "Basic some-creds" },
    });

    const result = await verifyAuth(request);
    expect(result).toBeNull();
    expect(mockVerifyAuthToken).not.toHaveBeenCalled();
  });

  it("returns null when token verification throws", async () => {
    mockVerifyAuthToken.mockRejectedValue(new Error("Invalid token"));

    const request = new Request("http://localhost/api/test", {
      headers: { Authorization: "Bearer bad-token" },
    });

    const result = await verifyAuth(request);
    expect(result).toBeNull();
  });
});

describe("initiateKyc", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("PRIVY_APP_ID", "test-app-id");
    vi.stubEnv("PRIVY_APP_SECRET", "test-app-secret");
    vi.stubEnv("PRIVY_KYC_PROVIDER", "bridge-sandbox");
  });

  const kycData = {
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

  it("calls Privy API with correct URL, headers, and body", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ status: "under_review", provider_user_id: "bridge-123" }),
    });

    await initiateKyc("did:privy:abc123", kycData);

    expect(mockFetch).toHaveBeenCalledWith(
      "https://auth.privy.io/api/v1/users/did:privy:abc123/fiat/kyc",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          "privy-app-id": "test-app-id",
        }),
      })
    );

    const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(callBody.provider).toBe("bridge-sandbox");
    expect(callBody.data.first_name).toBe("John");
    expect(callBody.data.last_name).toBe("Doe");
    expect(callBody.data.birth_date).toBe("1990-01-15");
    expect(callBody.data.residential_address.city).toBe("New York");
  });

  it("throws on non-200 response", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: "bad request" }),
    });

    await expect(initiateKyc("did:privy:abc123", kycData)).rejects.toThrow(
      "KYC initiation failed"
    );
  });
});

describe("getKycStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("PRIVY_APP_ID", "test-app-id");
    vi.stubEnv("PRIVY_APP_SECRET", "test-app-secret");
    vi.stubEnv("PRIVY_KYC_PROVIDER", "bridge-sandbox");
  });

  it("returns status from Privy API", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ status: "active", provider_user_id: "bridge-456" }),
    });

    const result = await getKycStatus("did:privy:abc123");

    expect(result).toEqual({ status: "active", providerUserId: "bridge-456" });
    expect(mockFetch).toHaveBeenCalledWith(
      "https://auth.privy.io/api/v1/users/did:privy:abc123/fiat/kyc?provider=bridge-sandbox",
      expect.objectContaining({ method: "GET" })
    );
  });

  it("returns not_found on 404 response", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
    });

    const result = await getKycStatus("did:privy:abc123");
    expect(result).toEqual({ status: "not_found", providerUserId: null });
  });

  it("throws on non-404 error response", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
    });

    await expect(getKycStatus("did:privy:abc123")).rejects.toThrow(
      "KYC status check failed: 500"
    );
  });
});

describe("mapPrivyKycStatus", () => {
  it("maps not_found to NOT_STARTED", () => {
    expect(mapPrivyKycStatus("not_found")).toBe("NOT_STARTED");
  });

  it("maps not_started to NOT_STARTED", () => {
    expect(mapPrivyKycStatus("not_started")).toBe("NOT_STARTED");
  });

  it("maps incomplete to NOT_STARTED", () => {
    expect(mapPrivyKycStatus("incomplete")).toBe("NOT_STARTED");
  });

  it("maps under_review to UNDER_REVIEW", () => {
    expect(mapPrivyKycStatus("under_review")).toBe("UNDER_REVIEW");
  });

  it("maps awaiting_questionnaire to UNDER_REVIEW", () => {
    expect(mapPrivyKycStatus("awaiting_questionnaire")).toBe("UNDER_REVIEW");
  });

  it("maps awaiting_ubo to UNDER_REVIEW", () => {
    expect(mapPrivyKycStatus("awaiting_ubo")).toBe("UNDER_REVIEW");
  });

  it("maps paused to UNDER_REVIEW", () => {
    expect(mapPrivyKycStatus("paused")).toBe("UNDER_REVIEW");
  });

  it("maps active to ACTIVE", () => {
    expect(mapPrivyKycStatus("active")).toBe("ACTIVE");
  });

  it("maps rejected to REJECTED", () => {
    expect(mapPrivyKycStatus("rejected")).toBe("REJECTED");
  });

  it("maps offboarded to REJECTED", () => {
    expect(mapPrivyKycStatus("offboarded")).toBe("REJECTED");
  });

  it("maps unknown status to NOT_STARTED", () => {
    expect(mapPrivyKycStatus("some_unknown_status")).toBe("NOT_STARTED");
  });
});
