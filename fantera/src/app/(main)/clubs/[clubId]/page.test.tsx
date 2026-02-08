import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Suspense } from "react";

const mockUseClub = vi.fn();

vi.mock("@/hooks/use-club", () => ({
  useClub: (...args: unknown[]) => mockUseClub(...args),
}));

import ClubDetailPage from "./page";

function createParams(clubId: string) {
  return Promise.resolve({ clubId });
}

async function renderPage(clubId: string) {
  await act(async () => {
    render(
      <Suspense fallback={<div data-testid="suspense-fallback" />}>
        <ClubDetailPage params={createParams(clubId)} />
      </Suspense>
    );
  });
}

describe("ClubDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders skeleton during loading state", async () => {
    mockUseClub.mockReturnValue({
      data: undefined,
      isPending: true,
      isError: false,
    });

    await renderPage("club-1");

    const skeletons = document.querySelectorAll('[class*="bg-surface"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders error state with back link when fetch fails", async () => {
    mockUseClub.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
    });

    await renderPage("club-1");

    expect(screen.getByText("Club not found")).toBeInTheDocument();
    const backLink = screen.getByRole("link", { name: /Back to Clubs/i });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute("href", "/clubs");
  });

  it("renders ClubDetail when data is loaded", async () => {
    mockUseClub.mockReturnValue({
      data: {
        data: {
          id: "club-1",
          name: "Juventus",
          ticker: "JUVE.MI",
          exchange: "Borsa Italiana",
          crestUrl: "/crests/juve.png",
          colorConfig: {
            primary: "#000000",
            secondary: "#FFFFFF",
            gradientStart: "#1a1a1a",
            gradientEnd: "#000000",
            glowColor: "rgba(255, 255, 255, 0.3)",
          },
          price: 0.32,
          changePct: 2.5,
          about: {
            country: "Italy",
            league: "Serie A",
            marketContext: "Test context",
          },
        },
      },
      isPending: false,
      isError: false,
    });

    await renderPage("club-1");

    expect(
      screen.getByRole("heading", { level: 2, name: "Juventus" })
    ).toBeInTheDocument();
    expect(screen.getByText("€0.32")).toBeInTheDocument();
  });

  it("passes clubId from params to useClub hook", async () => {
    mockUseClub.mockReturnValue({
      data: undefined,
      isPending: true,
      isError: false,
    });

    await renderPage("test-club-id");

    expect(mockUseClub).toHaveBeenCalledWith("test-club-id");
  });
});
