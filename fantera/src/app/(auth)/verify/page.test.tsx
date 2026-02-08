import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetAccessToken = vi.fn().mockResolvedValue("test-token");
const mockReplace = vi.fn();
const mockFetch = vi.fn();

vi.mock("@privy-io/react-auth", () => ({
  usePrivy: () => ({
    getAccessToken: mockGetAccessToken,
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

vi.stubGlobal("fetch", mockFetch);

import VerifyPage from "./page";

describe("VerifyPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders form when KYC status is NOT_STARTED", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: { kycStatus: "NOT_STARTED" } }),
    });

    render(<VerifyPage />);

    await waitFor(() => {
      expect(screen.getByText("Verify Your Identity")).toBeInTheDocument();
    });
    expect(screen.getByLabelText("First Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Last Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Verify Identity" })
    ).toBeInTheDocument();
  });

  it("shows pending state when KYC status is UNDER_REVIEW", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: { kycStatus: "UNDER_REVIEW" },
      }),
    });

    render(<VerifyPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Verifying your identity...")
      ).toBeInTheDocument();
    });
  });

  it("shows error state when KYC status is REJECTED", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: { kycStatus: "REJECTED" },
      }),
    });

    render(<VerifyPage />);

    await waitFor(() => {
      expect(
        screen.getByText("We couldn't verify your identity.")
      ).toBeInTheDocument();
    });
    expect(
      screen.getByRole("button", { name: "Try Again" })
    ).toBeInTheDocument();
  });

  it("submits form data to POST /api/auth/kyc", async () => {
    const user = userEvent.setup();

    // First call: GET status check returns NOT_STARTED
    // Second call: POST submit returns UNDER_REVIEW
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { kycStatus: "NOT_STARTED" },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { kycStatus: "UNDER_REVIEW" },
        }),
      });

    render(<VerifyPage />);

    await waitFor(() => {
      expect(screen.getByLabelText("First Name")).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText("First Name"), "John");
    await user.type(screen.getByLabelText("Last Name"), "Doe");
    await user.type(screen.getByLabelText("Email"), "john@example.com");
    await user.type(screen.getByLabelText("Date of Birth"), "1990-01-15");
    await user.type(screen.getByLabelText("Street Address"), "123 Main St");
    await user.type(screen.getByLabelText("City"), "New York");
    await user.type(screen.getByLabelText("State / Province"), "NY");
    await user.type(screen.getByLabelText("Postal Code"), "10001");
    await user.type(screen.getByLabelText("Country (ISO)"), "USA");

    await user.click(screen.getByRole("button", { name: "Verify Identity" }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/auth/kyc", expect.objectContaining({
        method: "POST",
      }));
    });
  });
});
