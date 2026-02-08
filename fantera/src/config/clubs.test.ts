import { describe, it, expect } from "vitest";
import { CLUB_CONFIGS, getClubConfig, getCurrencySymbol } from "./clubs";

describe("CLUB_CONFIGS", () => {
  const requiredFields = [
    "primary",
    "secondary",
    "gradientStart",
    "gradientEnd",
    "glowColor",
    "crestUrl",
  ] as const;

  it("has 15+ clubs", () => {
    expect(Object.keys(CLUB_CONFIGS).length).toBeGreaterThanOrEqual(15);
  });

  it.each(Object.entries(CLUB_CONFIGS))(
    "%s has all required fields",
    (ticker, config) => {
      for (const field of requiredFields) {
        expect(config[field]).toBeDefined();
        expect(typeof config[field]).toBe("string");
        expect(config[field].length).toBeGreaterThan(0);
      }
    }
  );

  it("has no duplicate tickers", () => {
    const tickers = Object.keys(CLUB_CONFIGS);
    const uniqueTickers = new Set(tickers);
    expect(uniqueTickers.size).toBe(tickers.length);
  });

  it("all crestUrls follow /crests/ pattern", () => {
    for (const [, config] of Object.entries(CLUB_CONFIGS)) {
      expect(config.crestUrl).toMatch(/^\/crests\/.+\.png$/);
    }
  });
});

describe("getClubConfig", () => {
  it("returns config for valid ticker", () => {
    const config = getClubConfig("MANU");
    expect(config).toBeDefined();
    expect(config!.primary).toBe("#DA291C");
  });

  it("returns undefined for invalid ticker", () => {
    expect(getClubConfig("INVALID")).toBeUndefined();
  });
});

describe("getCurrencySymbol", () => {
  it("returns € for Borsa Italiana", () => {
    expect(getCurrencySymbol("Borsa Italiana")).toBe("€");
  });

  it("returns € for Euronext exchanges", () => {
    expect(getCurrencySymbol("Euronext Lisbon")).toBe("€");
    expect(getCurrencySymbol("Euronext Amsterdam")).toBe("€");
    expect(getCurrencySymbol("Euronext Paris")).toBe("€");
  });

  it("returns £ for London SE", () => {
    expect(getCurrencySymbol("London SE")).toBe("£");
  });

  it("returns $ for NYSE", () => {
    expect(getCurrencySymbol("NYSE")).toBe("$");
  });

  it("returns ₺ for Borsa Istanbul", () => {
    expect(getCurrencySymbol("Borsa Istanbul")).toBe("₺");
  });

  it("returns $ as fallback for unknown exchange", () => {
    expect(getCurrencySymbol("Unknown Exchange")).toBe("$");
  });
});
