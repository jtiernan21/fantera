import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetAccessToken = vi.fn().mockResolvedValue("test-token");
const mockFetch = vi.fn();

vi.mock("@privy-io/react-auth", () => ({
  usePrivy: () => ({
    getAccessToken: mockGetAccessToken,
  }),
}));

vi.stubGlobal("fetch", mockFetch);

import { useKycStatus } from "./use-kyc-status";

describe("useKycStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns isLoading: true initially", () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: { kycStatus: "NOT_STARTED" } }),
    });

    const { result } = renderHook(() => useKycStatus());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.kycStatus).toBeNull();
  });

  it("returns KYC status after fetch completes", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: { kycStatus: "ACTIVE" } }),
    });

    const { result } = renderHook(() => useKycStatus());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.kycStatus).toBe("ACTIVE");
    expect(result.current.error).toBe(false);
  });

  it("polls when status is UNDER_REVIEW and pollInterval is set", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: { kycStatus: "UNDER_REVIEW" },
      }),
    });

    const { result } = renderHook(() => useKycStatus(100));

    await waitFor(() => {
      expect(result.current.kycStatus).toBe("UNDER_REVIEW");
    });

    const initialCalls = mockFetch.mock.calls.length;

    // Wait for at least one poll cycle (using short interval of 100ms)
    await waitFor(
      () => {
        expect(mockFetch.mock.calls.length).toBeGreaterThan(initialCalls);
      },
      { timeout: 500 }
    );
  });

  it("stops polling when status changes to ACTIVE", async () => {
    let callCount = 0;
    mockFetch.mockImplementation(async () => {
      callCount++;
      const status = callCount <= 1 ? "UNDER_REVIEW" : "ACTIVE";
      return {
        ok: true,
        json: async () => ({ success: true, data: { kycStatus: status } }),
      };
    });

    const { result } = renderHook(() => useKycStatus(100));

    // Wait until status changes to ACTIVE
    await waitFor(
      () => {
        expect(result.current.kycStatus).toBe("ACTIVE");
      },
      { timeout: 1000 }
    );

    // Record call count after ACTIVE
    const callsAfterActive = mockFetch.mock.calls.length;

    // Wait a bit — no more polls should happen
    await new Promise((r) => setTimeout(r, 300));

    // Should not have made additional calls (tolerance of 1 for any in-flight)
    expect(mockFetch.mock.calls.length).toBeLessThanOrEqual(
      callsAfterActive + 1
    );
  });

  it("does not fetch when enabled is false", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: { kycStatus: "ACTIVE" } }),
    });

    const { result } = renderHook(() =>
      useKycStatus({ enabled: false })
    );

    // Give time for any potential fetch
    await new Promise((r) => setTimeout(r, 100));

    expect(mockFetch).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(true);
    expect(result.current.kycStatus).toBeNull();
  });

  it("sets error to true on fetch failure", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useKycStatus());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.error).toBe(true);
    expect(result.current.kycStatus).toBeNull();
  });

  it("accepts options object with pollInterval", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: { kycStatus: "UNDER_REVIEW" },
      }),
    });

    const { result } = renderHook(() =>
      useKycStatus({ pollInterval: 100, enabled: true })
    );

    await waitFor(() => {
      expect(result.current.kycStatus).toBe("UNDER_REVIEW");
    });

    const initialCalls = mockFetch.mock.calls.length;

    await waitFor(
      () => {
        expect(mockFetch.mock.calls.length).toBeGreaterThan(initialCalls);
      },
      { timeout: 500 }
    );
  });
});
