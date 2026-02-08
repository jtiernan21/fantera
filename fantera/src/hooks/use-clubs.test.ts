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

import { useClubs } from "./use-clubs";

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

describe("useClubs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns isPending: true initially", () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: [] }),
    });

    const { result } = renderHook(() => useClubs(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isPending).toBe(true);
  });

  it("returns club data after successful fetch", async () => {
    const mockClubs = [
      {
        id: "club-1",
        name: "Manchester United",
        ticker: "MANU",
        exchange: "NYSE",
        crestUrl: "/crests/manu.png",
        colorConfig: { primary: "#DA291C", secondary: "#FBE122" },
        price: 16.2,
        changePct: -1.1,
      },
    ];

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: mockClubs }),
    });

    const { result } = renderHook(() => useClubs(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(result.current.data?.data).toHaveLength(1);
    expect(result.current.data?.data[0].name).toBe("Manchester United");
  });

  it("handles error state", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({
        error: { message: "Internal server error" },
      }),
    });

    const { result } = renderHook(() => useClubs(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });
});
