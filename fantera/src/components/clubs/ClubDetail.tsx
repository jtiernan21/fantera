import { useState } from "react";
import { getCurrencySymbol } from "@/config/clubs";
import type { ClubDetailData } from "@/hooks/use-club";

type ClubDetailProps = {
  club: ClubDetailData;
};

export function ClubDetail({ club }: ClubDetailProps) {
  const [imgError, setImgError] = useState(false);
  const isPositive = club.changePct >= 0;
  const changePrefix = isPositive ? "+" : "\u2212";
  const changeColor = isPositive ? "text-success" : "text-error";
  const displayChange = `${changePrefix}${Math.abs(club.changePct).toFixed(1)}%`;

  return (
    <div className="flex flex-col items-center max-w-[640px] mx-auto px-4 lg:px-12 py-8">
      {/* Club Crest */}
      <div className="relative mb-6">
        <div
          className="absolute inset-0 rounded-full blur-2xl opacity-30"
          style={{ backgroundColor: club.colorConfig.glowColor || club.colorConfig.primary }}
        />
        <div
          className="relative w-[120px] h-[120px] rounded-full flex items-center justify-center"
          style={{ backgroundColor: club.colorConfig.primary }}
        >
          {!imgError && (
            <img
              src={club.crestUrl}
              alt={`${club.name} crest`}
              className="w-24 h-24 object-contain"
              onError={() => setImgError(true)}
            />
          )}
        </div>
      </div>

      {/* Club Name & Exchange */}
      <h2 className="font-heading font-bold text-[22px] md:text-[28px] text-text text-center mb-1">
        {club.name}
      </h2>
      <p className="text-[15px] text-text-muted font-body text-center mb-8">
        {club.ticker} &middot; {club.exchange}
      </p>

      {/* Price Section */}
      <div className="text-center mb-8">
        <p className="font-heading font-extrabold text-[28px] md:text-[36px] text-text">
          {getCurrencySymbol(club.exchange)}{club.price.toFixed(2)}
        </p>
        <p className={`text-[15px] font-body font-semibold ${changeColor}`}>
          {displayChange}
        </p>
      </div>

      {/* About Section */}
      <div className="w-full mb-8">
        <h3 className="font-heading font-semibold text-[18px] text-text mb-3">
          About {club.name}
        </h3>
        <div className="flex gap-2 mb-3">
          <span className="px-3 py-1 text-[13px] font-body text-text-secondary bg-glass border border-glass-border rounded-full">
            {club.about.country}
          </span>
          <span className="px-3 py-1 text-[13px] font-body text-text-secondary bg-glass border border-glass-border rounded-full">
            {club.about.league}
          </span>
        </div>
        <p className="text-[15px] text-text-secondary font-body leading-relaxed">
          {club.about.marketContext}
        </p>
      </div>

      {/* Buy CTA — Disabled Placeholder */}
      <button
        disabled
        className="w-full max-w-[320px] h-12 bg-coral text-text font-heading font-semibold text-base rounded-xl opacity-40 cursor-not-allowed"
        title="Coming soon in the next update"
      >
        Buy {club.name}
      </button>
    </div>
  );
}
