"use client";

import { use } from "react";
import Link from "next/link";
import { useClub } from "@/hooks/use-club";
import { ClubDetail } from "@/components/clubs/ClubDetail";
import { ClubDetailSkeleton } from "@/components/clubs/ClubDetailSkeleton";

export default function ClubDetailPage({
  params,
}: {
  params: Promise<{ clubId: string }>;
}) {
  const { clubId } = use(params);
  const { data, isPending, isError } = useClub(clubId);

  if (isPending) {
    return <ClubDetailSkeleton />;
  }

  if (isError || !data?.data) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <p className="text-text-secondary text-center mb-4">Club not found</p>
        <Link
          href="/clubs"
          className="px-6 py-3 bg-glass border border-glass-border text-text font-heading font-semibold rounded-lg hover:bg-surface-elevated transition-colors"
        >
          Back to Clubs
        </Link>
      </div>
    );
  }

  return <ClubDetail club={data.data} />;
}
