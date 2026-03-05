import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";

vi.mock("@/src/services/analytics.service", () => ({
  fetchAnalyticsData: vi.fn(),
}));

const mockStart = vi.fn();
const mockStop = vi.fn();
const mockToast = vi.fn();

vi.mock("@/src/store/useloadingstore", () => ({
  useLoadingStore: () => ({
    startLoading: mockStart,
    stopLoading: mockStop,
  }),
}));

vi.mock("@/src/store/usetoaststore", () => ({
  useToastStore: () => ({
    showToast: mockToast,
  }),
}));

vi.mock("next/link", () => ({
  default: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@/src/components/statcard", () => ({
  StatCard: ({ children, title }: any) => (
    <div>
      <div>{title}</div>
      {children}
    </div>
  ),
}));

vi.mock("@/src/components/chatbot", () => ({
  ChatBotDashboard: () => <div>ChatBot</div>,
}));

import { fetchAnalyticsData } from "@/src/services/analytics.service";
import DashboardPage from "./page";

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("renders analytics data", async () => {
    (fetchAnalyticsData as any).mockResolvedValue({
      totalCustomers: 10,
      topInterests: [{ name: "coffee", count: 5 }],
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Dashboard Overview")).toBeInTheDocument();
      expect(screen.getByText("10")).toBeInTheDocument();
      expect(screen.getByText("coffee")).toBeInTheDocument();
    });

    expect(mockStart).toHaveBeenCalled();
    expect(mockStop).toHaveBeenCalled();
  });

  it("handles analytics error", async () => {
    (fetchAnalyticsData as any).mockRejectedValue(new Error("fail"));

    render(<DashboardPage />);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith("Something went wrong.", "error");
    });
  });

  it("renders saved promos from localStorage", async () => {
    localStorage.setItem(
      "latest_ai_promo",
      JSON.stringify({
        ideas: [
          {
            theme: "Caramel Week",
            ready_message: "Promo message",
          },
        ],
      }),
    );

    (fetchAnalyticsData as any).mockResolvedValue({
      totalCustomers: 1,
      topInterests: [],
    });

    render(<DashboardPage />);

    const promos = await screen.findAllByText("Caramel Week");
    expect(promos).toHaveLength(2);
  });

  it("handles invalid localStorage JSON", async () => {
    localStorage.setItem("latest_ai_promo", "invalid-json");

    (fetchAnalyticsData as any).mockResolvedValue({
      totalCustomers: 1,
      topInterests: [],
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith("Something went wrong.", "error");
    });
  });

  it("copies promo to clipboard", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);

    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    localStorage.setItem(
      "latest_ai_promo",
      JSON.stringify({
        ideas: [
          {
            theme: "Copy Me",
            ready_message: "Message",
          },
        ],
      }),
    );

    (fetchAnalyticsData as any).mockResolvedValue({
      totalCustomers: 1,
      topInterests: [],
    });

    render(<DashboardPage />);

    const promoButton = await screen.findByRole("button", {
      name: /Copy Me/i,
    });
    fireEvent.click(promoButton.closest("button")!);

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledWith("Message");
    });

    expect(mockToast).toHaveBeenCalledWith(
      "Promo copied to clipboard!",
      "success",
    );
  });

  it("handles clipboard failure", async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockRejectedValue(new Error("fail")),
      },
    });

    localStorage.setItem(
      "latest_ai_promo",
      JSON.stringify({
        ideas: [
          {
            theme: "Fail Copy",
            ready_message: "Message",
          },
        ],
      }),
    );

    (fetchAnalyticsData as any).mockResolvedValue({
      totalCustomers: 1,
      topInterests: [],
    });

    render(<DashboardPage />);

    const promoButton = await screen.findByRole("button", {
      name: /Fail Copy/i,
    });
    fireEvent.click(promoButton.closest("button")!);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith("Failed to copy text.", "error");
    });
  });
});
