import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockGetAccessToken = vi.fn().mockResolvedValue("test-token");

vi.mock("@privy-io/react-auth", () => ({
  usePrivy: () => ({
    getAccessToken: mockGetAccessToken,
  }),
}));

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

import { usePrices, isPriceStale } from "./use-prices";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    );
  };
}

describe("usePrices", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns isPending: true initially", () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: [] }),
    });

    const { result } = renderHook(() => usePrices(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isPending).toBe(true);
  });

  it("returns hasStaleData: false when prices are fresh", async () => {
    const recentTime = new Date(Date.now() - 30_000).toISOString();

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: [
          {
            clubId: "club-1",
            ticker: "MANU",
            price: 16.2,
            changePct: -1.1,
            updatedAt: recentTime,
          },
        ],
      }),
    });

    const { result } = renderHook(() => usePrices(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(result.current.hasStaleData).toBe(false);
  });

  it("returns hasStaleData: true when prices are older than 2 minutes", async () => {
    const oldTime = new Date(Date.now() - 150_000).toISOString();

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: [
          {
            clubId: "club-1",
            ticker: "MANU",
            price: 16.2,
            changePct: -1.1,
            updatedAt: oldTime,
          },
        ],
      }),
    });

    const { result } = renderHook(() => usePrices(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(result.current.hasStaleData).toBe(true);
  });

  it("auto-refetches at 30-second interval", async () => {
    vi.useFakeTimers();

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: [] }),
    });

    renderHook(() => usePrices(), {
      wrapper: createWrapper(),
    });

    // Let initial fetch settle
    await vi.advanceTimersByTimeAsync(100);

    const initialCalls = mockFetch.mock.calls.length;

    // Advance past the 30s refetch interval
    await vi.advanceTimersByTimeAsync(31_000);

    expect(mockFetch.mock.calls.length).toBeGreaterThan(initialCalls);

    vi.useRealTimers();
  });

  it("returns price data after successful fetch", async () => {
    const mockPrices = [
      {
        clubId: "club-1",
        ticker: "MANU",
        price: 16.2,
        changePct: -1.1,
        updatedAt: "2026-02-08T03:00:00.000Z",
      },
    ];

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: mockPrices }),
    });

    const { result } = renderHook(() => usePrices(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(result.current.data?.data).toHaveLength(1);
    expect(result.current.data?.data[0].ticker).toBe("MANU");
  });
});

describe("isPriceStale", () => {
  it("returns false for recent timestamp", () => {
    const recentTime = new Date(Date.now() - 30_000).toISOString(); // 30 seconds ago
    expect(isPriceStale(recentTime)).toBe(false);
  });

  it("returns true for timestamp older than 2 minutes", () => {
    const oldTime = new Date(Date.now() - 150_000).toISOString(); // 2.5 minutes ago
    expect(isPriceStale(oldTime)).toBe(true);
  });

  it("respects custom threshold parameter", () => {
    const time = new Date(Date.now() - 60_000).toISOString(); // 1 minute ago

    expect(isPriceStale(time, 30_000)).toBe(true); // 30s threshold → stale
    expect(isPriceStale(time, 120_000)).toBe(false); // 2min threshold → fresh
  });
});
