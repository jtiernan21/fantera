import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ClubDetail } from "./ClubDetail";
import type { ClubDetailData } from "@/hooks/use-club";

const mockClub: ClubDetailData = {
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
    marketContext: "Italy's most successful club with 36 league titles.",
  },
};

describe("ClubDetail", () => {
  it("renders crest with correct alt text", () => {
    render(<ClubDetail club={mockClub} />);

    const img = screen.getByAltText("Juventus crest");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/crests/juve.png");
  });

  it("renders club name as H2", () => {
    render(<ClubDetail club={mockClub} />);

    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toHaveTextContent("Juventus");
  });

  it("renders price with correct currency symbol and 2 decimal places", () => {
    render(<ClubDetail club={mockClub} />);

    // Borsa Italiana → €
    expect(screen.getByText("€0.32")).toBeInTheDocument();
  });

  it("renders USD currency for NYSE exchange", () => {
    const nyseClub = { ...mockClub, exchange: "NYSE", price: 1.5 };
    render(<ClubDetail club={nyseClub} />);

    expect(screen.getByText("$1.50")).toBeInTheDocument();
  });

  it("renders positive change with + prefix and success color class", () => {
    render(<ClubDetail club={mockClub} />);

    const changeEl = screen.getByText("+2.5%");
    expect(changeEl).toBeInTheDocument();
    expect(changeEl.className).toContain("text-success");
  });

  it("renders negative change with minus prefix and error color class", () => {
    const negativeClub = { ...mockClub, changePct: -1.3 };
    render(<ClubDetail club={negativeClub} />);

    const changeEl = screen.getByText("\u22121.3%");
    expect(changeEl).toBeInTheDocument();
    expect(changeEl.className).toContain("text-error");
  });

  it("renders exchange ticker and exchange name", () => {
    render(<ClubDetail club={mockClub} />);

    expect(screen.getByText(/JUVE\.MI/)).toBeInTheDocument();
    expect(screen.getByText(/Borsa Italiana/)).toBeInTheDocument();
  });

  it("renders about section with country, league, and market context", () => {
    render(<ClubDetail club={mockClub} />);

    expect(screen.getByText("About Juventus")).toBeInTheDocument();
    expect(screen.getByText("Italy")).toBeInTheDocument();
    expect(screen.getByText("Serie A")).toBeInTheDocument();
    expect(
      screen.getByText(/Italy's most successful club/)
    ).toBeInTheDocument();
  });

  it("renders disabled buy button with club name", () => {
    render(<ClubDetail club={mockClub} />);

    const button = screen.getByRole("button", { name: /Buy Juventus/i });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it("buy button has title text", () => {
    render(<ClubDetail club={mockClub} />);

    const button = screen.getByRole("button", { name: /Buy Juventus/i });
    expect(button).toHaveAttribute(
      "title",
      "Coming soon in the next update"
    );
  });

  it("renders radial glow with club glowColor", () => {
    const { container } = render(<ClubDetail club={mockClub} />);

    const glowEl = container.querySelector(".blur-2xl.opacity-30");
    expect(glowEl).toBeInTheDocument();
    expect(glowEl).toHaveStyle({
      backgroundColor: "rgba(255, 255, 255, 0.3)",
    });
  });
});
