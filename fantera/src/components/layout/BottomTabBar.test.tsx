import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { BottomTabBar } from "./BottomTabBar";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/clubs"),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    className,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

afterEach(() => {
  cleanup();
});

describe("BottomTabBar", () => {
  it("renders three tabs", () => {
    render(<BottomTabBar />);
    expect(screen.getByText("Portfolio")).toBeInTheDocument();
    expect(screen.getByText("Clubs")).toBeInTheDocument();
    expect(screen.getByText("Wallet")).toBeInTheDocument();
  });

  it("renders navigation links to correct routes", () => {
    render(<BottomTabBar />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(3);
    expect(links[0]).toHaveAttribute("href", "/portfolio");
    expect(links[1]).toHaveAttribute("href", "/clubs");
    expect(links[2]).toHaveAttribute("href", "/wallet");
  });

  it("applies active style to current route tab", () => {
    render(<BottomTabBar />);
    const clubsLink = screen.getByText("Clubs").closest("a");
    const portfolioLink = screen.getByText("Portfolio").closest("a");
    expect(clubsLink?.className).toContain("text-white");
    expect(portfolioLink?.className).toContain("text-text-muted");
  });

  it("renders SVG icons for each tab", () => {
    const { container } = render(<BottomTabBar />);
    const svgs = container.querySelectorAll("svg");
    expect(svgs).toHaveLength(3);
    svgs.forEach((svg) => {
      expect(svg.getAttribute("width")).toBe("24");
      expect(svg.getAttribute("height")).toBe("24");
    });
  });
});
