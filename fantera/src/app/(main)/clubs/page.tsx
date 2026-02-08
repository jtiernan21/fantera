"use client";

import { useMemo, useState } from "react";
import { useClubs } from "@/hooks/use-clubs";
import { usePrices } from "@/hooks/use-prices";
import { ClubCrestRow } from "@/components/clubs/ClubCrestRow";
import { ClubListSkeleton } from "@/components/clubs/ClubListSkeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function ClubsPage() {
  const { data, isPending, isError, refetch } = useClubs();
  const { data: pricesData } = usePrices();
  const [searchQuery, setSearchQuery] = useState("");

  // Build a prices lookup map for live price overlay
  const priceMap = useMemo(
    () =>
      new Map(
        pricesData?.data?.map((p) => [p.clubId, { price: p.price, changePct: p.changePct }]) ?? []
      ),
    [pricesData?.data]
  );

  const filteredClubs = useMemo(() => {
    const clubs = data?.data ?? [];
    if (!searchQuery.trim()) return clubs;

    const query = searchQuery.toLowerCase().trim();
    return clubs.filter(
      (club) =>
        club.name.toLowerCase().includes(query) ||
        club.ticker.toLowerCase().includes(query)
    );
  }, [data?.data, searchQuery]);

  return (
    <div className="min-h-screen bg-base">
      <div className="px-4 pt-6 pb-4">
        <h1 className="font-heading font-bold text-2xl text-text">Clubs</h1>
      </div>

      <div className="px-4 pb-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search clubs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-glass border-glass-border focus-visible:ring-coral focus-visible:ring-2 text-text placeholder:text-text-secondary"
          />
          {searchQuery.length > 0 && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral rounded-sm"
              aria-label="Clear search input"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {isPending && <ClubListSkeleton />}

      {isError && (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <p className="text-text-secondary text-center mb-4">
            Unable to load clubs
          </p>
          <button
            onClick={() => refetch()}
            className="px-6 py-3 bg-coral text-text font-heading font-semibold rounded-lg hover:bg-coral-hover transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      {data?.data && data.data.length === 0 && (
        <div className="flex items-center justify-center py-16">
          <p className="text-text-secondary">No clubs available</p>
        </div>
      )}

      {data?.data && data.data.length > 0 && filteredClubs.length === 0 && searchQuery.length > 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <p className="text-text-secondary text-center">
            No clubs match your search
          </p>
          <Button
            variant="ghost"
            onClick={() => setSearchQuery("")}
            className="text-coral hover:text-coral/80"
          >
            Clear search
          </Button>
        </div>
      )}

      {data?.data && data.data.length > 0 && filteredClubs.length > 0 && (
        <div>
          {filteredClubs.map((club) => {
            const livePrice = priceMap.get(club.id);
            return (
              <ClubCrestRow
                key={club.id}
                club={{
                  ...club,
                  price: livePrice?.price ?? club.price,
                  changePct: livePrice?.changePct ?? club.changePct,
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
