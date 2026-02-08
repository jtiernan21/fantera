import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ClubsPage from "./page";

const mockClubs = [
  {
    id: "club-juve",
    name: "Juventus",
    ticker: "JUVE",
    exchange: "Borsa Italiana",
    crestUrl: "/crests/juve.png",
    colorConfig: { primary: "#000000", secondary: "#FFFFFF" },
    price: 0.32,
    changePct: 1.5,
  },
  {
    id: "club-bvb",
    name: "Borussia Dortmund",
    ticker: "BVB",
    exchange: "Borsa Italiana",
    crestUrl: "/crests/bvb.png",
    colorConfig: { primary: "#FDE100", secondary: "#000000" },
    price: 3.4,
    changePct: -0.8,
  },
  {
    id: "club-manu",
    name: "Manchester United",
    ticker: "MANU",
    exchange: "NYSE",
    crestUrl: "/crests/manu.png",
    colorConfig: { primary: "#DA291C", secondary: "#FBE122" },
    price: 16.2,
    changePct: -1.1,
  },
];

vi.mock("@/hooks/use-clubs", () => ({
  useClubs: vi.fn(() => ({
    data: { data: mockClubs },
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  })),
}));

vi.mock("@/hooks/use-prices", () => ({
  usePrices: vi.fn(() => ({
    data: { data: [] },
  })),
}));

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

vi.mock("@/config/clubs", () => ({
  getCurrencySymbol: (exchange: string) => {
    if (exchange === "NYSE") return "$";
    if (exchange === "London SE") return "£";
    return "€";
  },
}));

describe("ClubsPage - Search & Filter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders search input with correct placeholder", () => {
    render(<ClubsPage />);

    const input = screen.getByPlaceholderText("Search clubs...");
    expect(input).toBeInTheDocument();
  });

  it("filters club list when typing in search input", async () => {
    const user = userEvent.setup();
    render(<ClubsPage />);

    expect(screen.getByText("Juventus")).toBeInTheDocument();
    expect(screen.getByText("Borussia Dortmund")).toBeInTheDocument();
    expect(screen.getByText("Manchester United")).toBeInTheDocument();

    const input = screen.getByPlaceholderText("Search clubs...");
    await user.type(input, "Juv");

    expect(screen.getByText("Juventus")).toBeInTheDocument();
    expect(screen.queryByText("Borussia Dortmund")).not.toBeInTheDocument();
    expect(screen.queryByText("Manchester United")).not.toBeInTheDocument();
  });

  it("filtering is case-insensitive", async () => {
    const user = userEvent.setup();
    render(<ClubsPage />);

    const input = screen.getByPlaceholderText("Search clubs...");
    await user.type(input, "juv");

    expect(screen.getByText("Juventus")).toBeInTheDocument();
    expect(screen.queryByText("Borussia Dortmund")).not.toBeInTheDocument();
  });

  it("filters by ticker", async () => {
    const user = userEvent.setup();
    render(<ClubsPage />);

    const input = screen.getByPlaceholderText("Search clubs...");
    await user.type(input, "BVB");

    expect(screen.getByText("Borussia Dortmund")).toBeInTheDocument();
    expect(screen.queryByText("Juventus")).not.toBeInTheDocument();
    expect(screen.queryByText("Manchester United")).not.toBeInTheDocument();
  });

  it('shows "No clubs match your search" when no matches', async () => {
    const user = userEvent.setup();
    render(<ClubsPage />);

    const input = screen.getByPlaceholderText("Search clubs...");
    await user.type(input, "zzzzz");

    expect(
      screen.getByText("No clubs match your search")
    ).toBeInTheDocument();
  });

  it('"Clear search" button resets the list to all clubs', async () => {
    const user = userEvent.setup();
    render(<ClubsPage />);

    const input = screen.getByPlaceholderText("Search clubs...");
    await user.type(input, "zzzzz");

    expect(
      screen.getByText("No clubs match your search")
    ).toBeInTheDocument();

    const clearButton = screen.getByText("Clear search");
    await user.click(clearButton);

    expect(screen.getByText("Juventus")).toBeInTheDocument();
    expect(screen.getByText("Borussia Dortmund")).toBeInTheDocument();
    expect(screen.getByText("Manchester United")).toBeInTheDocument();
  });

  it("clear X icon in input resets the list and clears input value", async () => {
    const user = userEvent.setup();
    render(<ClubsPage />);

    const input = screen.getByPlaceholderText("Search clubs...");
    await user.type(input, "Juv");

    expect(screen.queryByText("Borussia Dortmund")).not.toBeInTheDocument();

    const clearIcon = screen.getByLabelText("Clear search input");
    await user.click(clearIcon);

    expect(input).toHaveValue("");
    expect(screen.getByText("Juventus")).toBeInTheDocument();
    expect(screen.getByText("Borussia Dortmund")).toBeInTheDocument();
    expect(screen.getByText("Manchester United")).toBeInTheDocument();
  });

  it("search input does NOT have autoFocus attribute", () => {
    render(<ClubsPage />);

    const input = screen.getByPlaceholderText("Search clubs...");
    expect(input).not.toHaveAttribute("autofocus");
  });

  it("search input has glass styling classes", () => {
    render(<ClubsPage />);

    const input = screen.getByPlaceholderText("Search clubs...");
    expect(input.className).toContain("bg-glass");
    expect(input.className).toContain("border-glass-border");
    expect(input.className).toContain("focus-visible:ring-coral");
  });

  it("X clear button has focus-visible styling", async () => {
    const user = userEvent.setup();
    render(<ClubsPage />);

    const input = screen.getByPlaceholderText("Search clubs...");
    await user.type(input, "test");

    const clearIcon = screen.getByLabelText("Clear search input");
    expect(clearIcon.className).toContain("focus-visible:outline-coral");
  });

  it("empty search query (spaces only) shows full list", async () => {
    const user = userEvent.setup();
    render(<ClubsPage />);

    const input = screen.getByPlaceholderText("Search clubs...");
    await user.type(input, "   ");

    expect(screen.getByText("Juventus")).toBeInTheDocument();
    expect(screen.getByText("Borussia Dortmund")).toBeInTheDocument();
    expect(screen.getByText("Manchester United")).toBeInTheDocument();
  });
});
