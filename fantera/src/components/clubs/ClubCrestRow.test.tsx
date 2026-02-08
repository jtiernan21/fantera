import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ClubCrestRow } from "./ClubCrestRow";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const mockClub = {
  id: "club-1",
  name: "Manchester United",
  ticker: "MANU",
  exchange: "NYSE",
  crestUrl: "/crests/manu.png",
  colorConfig: {
    primary: "#DA291C",
    secondary: "#FBE122",
  },
  price: 16.2,
  changePct: -1.1,
};

describe("ClubCrestRow", () => {
  it("renders club name and ticker", () => {
    render(<ClubCrestRow club={mockClub} />);

    expect(screen.getByText("Manchester United")).toBeInTheDocument();
    expect(screen.getByText(/MANU/)).toBeInTheDocument();
    expect(screen.getByText(/NYSE/)).toBeInTheDocument();
  });

  it("renders price with $ prefix and 2 decimal places", () => {
    render(<ClubCrestRow club={mockClub} />);

    expect(screen.getByText("$16.20")).toBeInTheDocument();
  });

  it("renders negative change with minus prefix and error color", () => {
    render(<ClubCrestRow club={mockClub} />);

    const changeEl = screen.getByText("\u22121.1%");
    expect(changeEl).toBeInTheDocument();
    expect(changeEl.className).toContain("text-error");
  });

  it("renders positive change with + prefix and success color", () => {
    const positiveClub = { ...mockClub, changePct: 2.5 };
    render(<ClubCrestRow club={positiveClub} />);

    const changeEl = screen.getByText("+2.5%");
    expect(changeEl).toBeInTheDocument();
    expect(changeEl.className).toContain("text-success");
  });

  it("renders link to correct club detail URL", () => {
    render(<ClubCrestRow club={mockClub} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/clubs/club-1");
  });

  it("renders crest image with alt text", () => {
    render(<ClubCrestRow club={mockClub} />);

    const img = screen.getByAltText("Manchester United crest");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/crests/manu.png");
  });

  it("renders zero change with + prefix and success color", () => {
    const zeroClub = { ...mockClub, changePct: 0 };
    render(<ClubCrestRow club={zeroClub} />);

    const changeEl = screen.getByText("+0.0%");
    expect(changeEl).toBeInTheDocument();
    expect(changeEl.className).toContain("text-success");
  });

  it("renders correct currency symbol for European exchange", () => {
    const euroClub = { ...mockClub, exchange: "Borsa Italiana", price: 0.32 };
    render(<ClubCrestRow club={euroClub} />);

    expect(screen.getByText("€0.32")).toBeInTheDocument();
  });

  it("renders correct currency symbol for UK exchange", () => {
    const ukClub = { ...mockClub, exchange: "London SE", price: 1.30 };
    render(<ClubCrestRow club={ukClub} />);

    expect(screen.getByText("£1.30")).toBeInTheDocument();
  });
});
