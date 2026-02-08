"use client";

import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { createAuthFetch } from "@/lib/auth-fetch";

export type ClubDetailData = {
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
  about: {
    country: string;
    league: string;
    marketContext: string;
  };
};

export function useClub(clubId: string) {
  const { getAccessToken } = usePrivy();
  const authFetch = createAuthFetch(getAccessToken);

  return useQuery<{ data: ClubDetailData }>({
    queryKey: ["clubs", clubId],
    queryFn: () => authFetch(`/api/clubs/${clubId}`),
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
    enabled: !!clubId,
  });
}
