"use client";

import { useState } from "react";
import Link from "next/link";
import { getCurrencySymbol } from "@/config/clubs";

type ClubCrestRowProps = {
  club: {
    id: string;
    name: string;
    ticker: string;
    exchange: string;
    crestUrl: string;
    colorConfig: {
      primary: string;
      secondary: string;
    };
    price: number;
    changePct: number;
  };
};

export function ClubCrestRow({ club }: ClubCrestRowProps) {
  const [imgError, setImgError] = useState(false);
  const isPositive = club.changePct >= 0;
  const changePrefix = isPositive ? "+" : "\u2212";
  const changeColor = isPositive ? "text-success" : "text-error";
  const displayChange = `${changePrefix}${Math.abs(club.changePct).toFixed(1)}%`;

  return (
    <Link
      href={`/clubs/${club.id}`}
      className="flex items-center gap-3 px-4 py-3 border-b border-glass-border hover:bg-surface-elevated transition-colors min-h-[64px]"
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
        style={{ backgroundColor: club.colorConfig.primary }}
      >
        {!imgError && (
          <img
            src={club.crestUrl}
            alt={`${club.name} crest`}
            className="w-8 h-8 object-contain"
            onError={() => setImgError(true)}
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-heading font-semibold text-[15px] text-text truncate">
          {club.name}
        </p>
        <p className="text-[13px] text-text-muted font-body">
          {club.ticker} · {club.exchange}
        </p>
      </div>

      <div className="text-right flex-shrink-0">
        <p className="font-heading font-bold text-[15px] text-text">
          {getCurrencySymbol(club.exchange)}{club.price.toFixed(2)}
        </p>
        <p className={`text-[13px] font-body font-semibold ${changeColor}`}>
          {displayChange}
        </p>
      </div>
    </Link>
  );
}
