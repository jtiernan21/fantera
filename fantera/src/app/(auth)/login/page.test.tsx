import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import LoginPage from "./page";

vi.mock("@privy-io/react-auth", () => ({
  usePrivy: () => ({
    ready: true,
    authenticated: false,
    login: vi.fn(),
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: vi.fn(),
  }),
}));

describe("LoginPage", () => {
  it("renders the heading and sign-in button", () => {
    render(<LoginPage />);
    expect(screen.getByText("Own Your Club")).toBeInTheDocument();
    expect(screen.getByText("Sign In")).toBeInTheDocument();
  });

  it("renders the subheading", () => {
    render(<LoginPage />);
    expect(
      screen.getByText("Sign in to start building your portfolio")
    ).toBeInTheDocument();
  });

  it("renders the sign-in button enabled when Privy is ready", () => {
    render(<LoginPage />);
    const button = screen.getByRole("button", { name: "Sign In" });
    expect(button).not.toBeDisabled();
  });
});
