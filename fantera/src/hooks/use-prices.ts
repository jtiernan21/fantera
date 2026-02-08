"use client";

import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { createAuthFetch } from "@/lib/auth-fetch";

export type PriceData = {
  clubId: string;
  ticker: string;
  price: number;
  changePct: number;
  updatedAt: string;
};

export function usePrices() {
  const { getAccessToken } = usePrivy();
  const authFetch = createAuthFetch(getAccessToken);

  const query = useQuery<{ data: PriceData[] }>({
    queryKey: ["prices"],
    queryFn: () => authFetch("/api/prices"),
    refetchInterval: 30 * 1000,
    refetchIntervalInBackground: false,
    staleTime: 15 * 1000,
  });

  const hasStaleData =
    query.data?.data?.some((p) => isPriceStale(p.updatedAt)) ?? false;

  return { ...query, hasStaleData };
}

/**
 * Utility to detect stale price data.
 * Returns true if the price update timestamp is older than the threshold.
 * Default threshold: 2 minutes (120000ms) per NFR18.
 */
export function isPriceStale(
  updatedAt: string,
  thresholdMs: number = 120_000
): boolean {
  const updatedTime = new Date(updatedAt).getTime();
  return Date.now() - updatedTime > thresholdMs;
}
