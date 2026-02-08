"use client";

import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { createAuthFetch } from "@/lib/auth-fetch";

export type ClubWithPrice = {
  id: string;
  name: string;
  ticker: string;
  exchange: string;
  crestUrl: string;
  colorConfig: {
    primary: string;
    secondary: string;
    gradientStart: string;
    gradientEnd: string;
    glowColor: string;
  };
  price: number;
  changePct: number;
};

export function useClubs() {
  const { getAccessToken } = usePrivy();
  const authFetch = createAuthFetch(getAccessToken);

  return useQuery<{ data: ClubWithPrice[] }>({
    queryKey: ["clubs"],
    queryFn: () => authFetch("/api/clubs"),
    staleTime: 30 * 1000, // 30 seconds — price data
  });
}
