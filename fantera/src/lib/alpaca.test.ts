import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockGetSnapshots } = vi.hoisted(() => ({
  mockGetSnapshots: vi.fn(),
}));

vi.mock("@alpacahq/alpaca-trade-api", () => {
  return {
    default: class MockAlpaca {
      getSnapshots = mockGetSnapshots;
    },
  };
});

import { getPrices } from "./alpaca";

describe("getPrices", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns correct { ticker, price, changePct } shape", async () => {
    mockGetSnapshots.mockResolvedValue([
      {
        Symbol: "MANU",
        LatestTrade: { Price: 16.5 },
        DailyBar: { ClosePrice: 16.2 },
        PrevDailyBar: { ClosePrice: 16.0 },
      },
    ]);

    const result = await getPrices(["MANU"]);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      ticker: "MANU",
      price: 16.2,
      changePct: 1.25, // ((16.2 - 16.0) / 16.0) * 100 = 1.25
    });
  });

  it("calculates change % correctly", async () => {
    mockGetSnapshots.mockResolvedValue([
      {
        Symbol: "JUVE.MI",
        LatestTrade: { Price: 0.35 },
        DailyBar: { ClosePrice: 0.32 },
        PrevDailyBar: { ClosePrice: 0.30 },
      },
    ]);

    const result = await getPrices(["JUVE.MI"]);

    // ((0.32 - 0.30) / 0.30) * 100 = 6.666... → rounded to 6.67
    expect(result[0].changePct).toBeCloseTo(6.67, 1);
  });

  it("falls back to LatestTrade.Price when DailyBar is missing", async () => {
    mockGetSnapshots.mockResolvedValue([
      {
        Symbol: "TEST",
        LatestTrade: { Price: 25.0 },
        DailyBar: null,
        PrevDailyBar: { ClosePrice: 24.0 },
      },
    ]);

    const result = await getPrices(["TEST"]);

    expect(result[0].price).toBe(25.0);
    expect(result[0].changePct).toBeCloseTo(4.17, 1); // ((25 - 24) / 24) * 100
  });

  it("handles null/missing snapshot for a ticker (skips, does not crash)", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    mockGetSnapshots.mockResolvedValue([
      {
        Symbol: "MANU",
        LatestTrade: { Price: 16.2 },
        DailyBar: { ClosePrice: 16.2 },
        PrevDailyBar: { ClosePrice: 16.0 },
      },
      null,
      undefined,
    ]);

    const result = await getPrices(["MANU", "BAD1", "BAD2"]);

    expect(result).toHaveLength(1);
    expect(result[0].ticker).toBe("MANU");

    warnSpy.mockRestore();
  });

  it("returns empty array for empty tickers input", async () => {
    const result = await getPrices([]);

    expect(result).toEqual([]);
    expect(mockGetSnapshots).not.toHaveBeenCalled();
  });

  it("returns changePct of 0 when prevDailyBar close is 0", async () => {
    mockGetSnapshots.mockResolvedValue([
      {
        Symbol: "ZERO",
        LatestTrade: { Price: 10.0 },
        DailyBar: { ClosePrice: 10.0 },
        PrevDailyBar: { ClosePrice: 0 },
      },
    ]);

    const result = await getPrices(["ZERO"]);

    expect(result[0].changePct).toBe(0);
  });

  it("skips tickers with no valid price data (price resolves to 0)", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    mockGetSnapshots.mockResolvedValue([
      {
        Symbol: "NODATA",
        LatestTrade: null,
        DailyBar: null,
        PrevDailyBar: { ClosePrice: 10.0 },
      },
      {
        Symbol: "MANU",
        LatestTrade: { Price: 16.5 },
        DailyBar: { ClosePrice: 16.2 },
        PrevDailyBar: { ClosePrice: 16.0 },
      },
    ]);

    const result = await getPrices(["NODATA", "MANU"]);

    expect(result).toHaveLength(1);
    expect(result[0].ticker).toBe("MANU");
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Skipping ticker NODATA")
    );

    warnSpy.mockRestore();
  });

  it("handles multiple tickers in a single batch", async () => {
    mockGetSnapshots.mockResolvedValue([
      {
        Symbol: "MANU",
        LatestTrade: { Price: 16.5 },
        DailyBar: { ClosePrice: 16.2 },
        PrevDailyBar: { ClosePrice: 16.0 },
      },
      {
        Symbol: "JUVE.MI",
        LatestTrade: { Price: 0.35 },
        DailyBar: { ClosePrice: 0.32 },
        PrevDailyBar: { ClosePrice: 0.30 },
      },
    ]);

    const result = await getPrices(["MANU", "JUVE.MI"]);

    expect(result).toHaveLength(2);
    expect(result[0].ticker).toBe("MANU");
    expect(result[1].ticker).toBe("JUVE.MI");
    expect(mockGetSnapshots).toHaveBeenCalledWith(["MANU", "JUVE.MI"]);
  });
});
