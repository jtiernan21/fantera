import { describe, it, expect, vi, beforeEach } from "vitest";
import { createAuthFetch } from "./auth-fetch";

describe("createAuthFetch", () => {
  const mockGetAccessToken = vi.fn<() => Promise<string | null>>();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(
        new Response(JSON.stringify({ success: true, data: "test" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
    );
  });

  it("adds Authorization header with Bearer token", async () => {
    mockGetAccessToken.mockResolvedValue("test-token-123");
    const authFetch = createAuthFetch(mockGetAccessToken);

    await authFetch("/api/test");

    expect(fetch).toHaveBeenCalledWith("/api/test", {
      headers: {
        Authorization: "Bearer test-token-123",
        "Content-Type": "application/json",
      },
    });
  });

  it("handles missing token gracefully", async () => {
    mockGetAccessToken.mockResolvedValue(null);
    const authFetch = createAuthFetch(mockGetAccessToken);

    await authFetch("/api/test");

    expect(fetch).toHaveBeenCalledWith("/api/test", {
      headers: {
        "Content-Type": "application/json",
      },
    });
  });

  it("throws on non-ok response", async () => {
    mockGetAccessToken.mockResolvedValue("token");
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: { message: "Not authenticated" },
          }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        )
      )
    );

    const authFetch = createAuthFetch(mockGetAccessToken);

    await expect(authFetch("/api/test")).rejects.toThrow("Not authenticated");
  });

  it("throws generic message when error response has no message", async () => {
    mockGetAccessToken.mockResolvedValue("token");
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(
        new Response("not json", {
          status: 500,
          headers: { "Content-Type": "text/plain" },
        })
      )
    );

    const authFetch = createAuthFetch(mockGetAccessToken);

    await expect(authFetch("/api/test")).rejects.toThrow("Request failed");
  });

  it("parses JSON response correctly", async () => {
    mockGetAccessToken.mockResolvedValue("token");
    const mockData = { success: true, data: { id: 1, name: "test" } };
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(
        new Response(JSON.stringify(mockData), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
    );

    const authFetch = createAuthFetch(mockGetAccessToken);
    const result = await authFetch("/api/test");

    expect(result).toEqual(mockData);
  });
});
