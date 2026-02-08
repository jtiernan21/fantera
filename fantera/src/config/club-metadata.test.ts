import { describe, it, expect } from "vitest";
import { getClubMetadata } from "./club-metadata";

const ALL_TICKERS = [
  "JUVE.MI",
  "BVB.DE",
  "AJAX.AS",
  "SLB.LS",
  "FCP.LS",
  "SCP.LS",
  "SCB.LS",
  "SSL.MI",
  "ASR.MI",
  "OLG.PA",
  "CCP.L",
  "PARKEN.CO",
  "GSRAY.IS",
  "MANU",
  "TICA.MX",
];

describe("getClubMetadata", () => {
  it.each(ALL_TICKERS)(
    "returns non-default metadata for %s",
    (ticker) => {
      const metadata = getClubMetadata(ticker);
      expect(metadata.country).not.toBe("Unknown");
      expect(metadata.league).not.toBe("Unknown");
      expect(metadata.marketContext).toBeTruthy();
      expect(metadata.marketContext).not.toContain(
        "A publicly traded football club available for fractional ownership"
      );
    }
  );

  it("returns default fallback for unknown ticker", () => {
    const metadata = getClubMetadata("UNKNOWN.XX");
    expect(metadata.country).toBe("Unknown");
    expect(metadata.league).toBe("Unknown");
    expect(metadata.marketContext).toContain("fractional ownership");
  });

  it("returns correct country for JUVE.MI", () => {
    const metadata = getClubMetadata("JUVE.MI");
    expect(metadata.country).toBe("Italy");
    expect(metadata.league).toBe("Serie A");
  });

  it("returns correct country for MANU", () => {
    const metadata = getClubMetadata("MANU");
    expect(metadata.country).toBe("England");
    expect(metadata.league).toBe("Premier League");
  });

  it("returns correct country for TICA.MX", () => {
    const metadata = getClubMetadata("TICA.MX");
    expect(metadata.country).toBe("Mexico");
    expect(metadata.league).toBe("Liga MX");
  });

  it("all 15 tickers have metadata", () => {
    expect(ALL_TICKERS).toHaveLength(15);
    for (const ticker of ALL_TICKERS) {
      const metadata = getClubMetadata(ticker);
      expect(metadata.country).toBeTruthy();
      expect(metadata.league).toBeTruthy();
      expect(metadata.marketContext).toBeTruthy();
    }
  });
});
