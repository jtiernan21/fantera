import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { mockVerifyWebhook, mockUpsert } = vi.hoisted(() => ({
  mockVerifyWebhook: vi.fn(),
  mockUpsert: vi.fn(),
}));

vi.mock("@/lib/privy", () => ({
  privyClient: {
    verifyWebhook: mockVerifyWebhook,
  },
}));

vi.mock("@/generated/prisma/client", () => ({
  PrismaClient: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      upsert: mockUpsert,
    },
  },
}));

import { POST } from "./route";

function createWebhookRequest(body: object) {
  return new NextRequest("http://localhost/api/auth/webhook", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "svix-id": "msg_123",
      "svix-timestamp": "1234567890",
      "svix-signature": "v1,valid-sig",
    },
  });
}

describe("POST /api/auth/webhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 and creates user on valid user.created webhook", async () => {
    mockVerifyWebhook.mockResolvedValue({
      type: "user.created",
      user: {
        id: "did:privy:user123",
        linked_accounts: [
          {
            type: "google_oauth",
            email: "test@example.com",
            name: "Test User",
          },
        ],
      },
    });
    mockUpsert.mockResolvedValue({});

    const req = createWebhookRequest({});
    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ received: true });
    expect(mockUpsert).toHaveBeenCalledWith({
      where: { privyId: "did:privy:user123" },
      update: { email: "test@example.com", displayName: "Test User", walletAddress: null },
      create: {
        privyId: "did:privy:user123",
        email: "test@example.com",
        displayName: "Test User",
        walletAddress: null,
      },
    });
  });

  it("returns 400 on invalid signature", async () => {
    mockVerifyWebhook.mockRejectedValue(new Error("Invalid signature"));

    const req = createWebhookRequest({});
    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: "Invalid webhook" });
  });

  it("handles missing email gracefully (WalletConnect signup)", async () => {
    mockVerifyWebhook.mockResolvedValue({
      type: "user.created",
      user: {
        id: "did:privy:wallet-user",
        linked_accounts: [{ type: "wallet", address: "0xabc123" }],
      },
    });
    mockUpsert.mockResolvedValue({});

    const req = createWebhookRequest({});
    const response = await POST(req);

    expect(response.status).toBe(200);
    expect(mockUpsert).toHaveBeenCalledWith({
      where: { privyId: "did:privy:wallet-user" },
      update: { email: null, displayName: null, walletAddress: "0xabc123" },
      create: {
        privyId: "did:privy:wallet-user",
        email: null,
        displayName: null,
        walletAddress: "0xabc123",
      },
    });
  });

  it("upserts (does not duplicate) on repeated webhook delivery", async () => {
    mockVerifyWebhook.mockResolvedValue({
      type: "user.created",
      user: {
        id: "did:privy:existing-user",
        linked_accounts: [{ type: "email", address: "repeat@example.com" }],
      },
    });
    mockUpsert.mockResolvedValue({});

    const req1 = createWebhookRequest({});
    const req2 = createWebhookRequest({});
    await POST(req1);
    await POST(req2);

    expect(mockUpsert).toHaveBeenCalledTimes(2);
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { privyId: "did:privy:existing-user" },
      })
    );
  });
});
