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

import { useClub } from "./use-club";

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

describe("useClub", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns isPending: true initially", () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: {} }),
    });

    const { result } = renderHook(() => useClub("club-1"), {
      wrapper: createWrapper(),
    });

    expect(result.current.isPending).toBe(true);
  });

  it("returns club detail data after successful fetch", async () => {
    const mockClub = {
      id: "club-1",
      name: "Juventus",
      ticker: "JUVE.MI",
      exchange: "Borsa Italiana",
      crestUrl: "/crests/juve.png",
      colorConfig: { primary: "#000000", secondary: "#FFFFFF" },
      price: 0.32,
      changePct: 2.5,
      about: {
        country: "Italy",
        league: "Serie A",
        marketContext: "Test context",
      },
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: mockClub }),
    });

    const { result } = renderHook(() => useClub("club-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(result.current.data?.data.name).toBe("Juventus");
    expect(result.current.data?.data.price).toBe(0.32);
    expect(result.current.data?.data.about.country).toBe("Italy");
  });

  it("auto-refetches at 30-second interval", async () => {
    vi.useFakeTimers();

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: {} }),
    });

    renderHook(() => useClub("club-1"), {
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

  it("handles error state", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({
        error: { message: "Internal server error" },
      }),
    });

    const { result } = renderHook(() => useClub("club-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });

  it("is disabled when clubId is empty string", () => {
    const { result } = renderHook(() => useClub(""), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
  });
});
