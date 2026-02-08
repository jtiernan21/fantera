import Alpaca from "@alpacahq/alpaca-trade-api";

// Server-side only — NEVER import this in client components (NFR9)
const alpaca = new Alpaca({
  keyId: process.env.ALPACA_API_KEY!,
  secretKey: process.env.ALPACA_API_SECRET!,
  paper: process.env.NODE_ENV !== "production",
});

export type PriceFeedResult = {
  ticker: string;
  price: number;
  changePct: number;
};

/**
 * Fetches latest prices for multiple tickers in a single batch API call.
 * Uses Alpaca's getSnapshots() which returns latest trade, daily bar, and prev daily bar.
 */
export async function getPrices(
  tickers: string[]
): Promise<PriceFeedResult[]> {
  if (tickers.length === 0) return [];

  const snapshots = await alpaca.getSnapshots(tickers);
  const results: PriceFeedResult[] = [];

  for (const snapshot of snapshots) {
    try {
      if (!snapshot) continue;

      const ticker = snapshot.Symbol;
      const currentPrice =
        snapshot.DailyBar?.ClosePrice ?? snapshot.LatestTrade?.Price ?? 0;
      const prevClose = snapshot.PrevDailyBar?.ClosePrice ?? 0;

      if (currentPrice === 0) {
        console.warn(
          `[alpaca] Skipping ticker ${ticker}: no valid price data`
        );
        continue;
      }

      const changePct =
        prevClose > 0 ? ((currentPrice - prevClose) / prevClose) * 100 : 0;

      results.push({
        ticker,
        price: currentPrice,
        changePct: Math.round(changePct * 100) / 100,
      });
    } catch (err) {
      console.warn(
        `[alpaca] Failed to process snapshot for ticker: ${snapshot?.Symbol}`,
        err
      );
    }
  }

  return results;
}

// Export client instance for reuse in brokerage execution (Story 2.3)
export { alpaca };
