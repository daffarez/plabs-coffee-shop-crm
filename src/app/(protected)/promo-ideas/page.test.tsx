import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PromoIdeasPage from "./page";
import { insightService } from "@/src/services/insight.service";

vi.mock("@/src/services/insight.service", () => ({
  insightService: {
    getStoredPromo: vi.fn(),
    fetchInsights: vi.fn(),
    generatePromo: vi.fn(),
    savePromo: vi.fn(),
    clearPromo: vi.fn(),
    safeJsonParse: vi.fn(),
  },
}));

vi.mock("@/src/store/usetoaststore", () => ({
  useToastStore: () => ({
    showToast: vi.fn(),
  }),
}));

vi.mock("@/src/store/useloadingstore", () => ({
  useLoadingStore: () => ({
    startLoading: vi.fn(),
    stopLoading: vi.fn(),
  }),
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe("PromoIdeasPage", () => {
  it("loads stored promo on mount", async () => {
    (insightService.getStoredPromo as any).mockReturnValue([
      {
        theme: "Stored Theme",
        segment_description: "desc",
        why_now: "why",
        ready_message: "msg",
      },
    ]);

    render(<PromoIdeasPage />);

    expect(await screen.findByText("Stored Theme")).toBeInTheDocument();
  });

  it("generates promo successfully", async () => {
    (insightService.fetchInsights as any).mockResolvedValue({ coffee: 10 });

    (insightService.generatePromo as any).mockResolvedValue({
      choices: [{ message: { content: "dummy" } }],
    });

    (insightService.safeJsonParse as any).mockReturnValue([
      {
        theme: "Promo",
        segment_description: "desc",
        why_now: "why",
        ready_message: "msg",
      },
    ]);

    render(<PromoIdeasPage />);

    fireEvent.click(screen.getByText(/Generate This Week’s Promo/i));

    expect(await screen.findByText("Promo")).toBeInTheDocument();

    expect(insightService.savePromo).toHaveBeenCalled();
  });

  it("handles wrapped promotions property", async () => {
    (insightService.fetchInsights as any).mockResolvedValue({ coffee: 10 });

    (insightService.generatePromo as any).mockResolvedValue({
      choices: [{ message: { content: "dummy" } }],
    });

    (insightService.safeJsonParse as any).mockReturnValue({
      promotions: [
        {
          theme: "Wrapped Promo",
          segment_description: "desc",
          why_now: "why",
          ready_message: "msg",
        },
      ],
    });

    render(<PromoIdeasPage />);

    fireEvent.click(screen.getByText(/Generate This Week’s Promo/i));

    expect(await screen.findByText("Wrapped Promo")).toBeInTheDocument();
  });

  it("handles unknown object wrapper", async () => {
    (insightService.fetchInsights as any).mockResolvedValue({ coffee: 10 });

    (insightService.generatePromo as any).mockResolvedValue({
      choices: [{ message: { content: "dummy" } }],
    });

    (insightService.safeJsonParse as any).mockReturnValue({
      data: [
        {
          theme: "Unknown Wrapped",
          segment_description: "desc",
          why_now: "why",
          ready_message: "msg",
        },
      ],
    });

    render(<PromoIdeasPage />);

    fireEvent.click(screen.getByText(/Generate This Week’s Promo/i));

    expect(await screen.findByText("Unknown Wrapped")).toBeInTheDocument();
  });

  it("shows error when generate fails", async () => {
    (insightService.fetchInsights as any).mockRejectedValue(new Error("fail"));

    render(<PromoIdeasPage />);

    fireEvent.click(screen.getByText(/Generate This Week’s Promo/i));

    expect(
      await screen.findByText(/System failed to brew your ideas/i),
    ).toBeInTheDocument();
  });

  it("clears promo using modal", async () => {
    (insightService.getStoredPromo as any).mockReturnValue([
      {
        theme: "Clear Me",
        segment_description: "desc",
        why_now: "why",
        ready_message: "msg",
      },
    ]);

    render(<PromoIdeasPage />);

    const clearButton = await screen.findByRole("button", { name: /clear/i });

    fireEvent.click(clearButton);

    fireEvent.click(screen.getByText(/Yes, Clear All/i));

    expect(insightService.clearPromo).toHaveBeenCalled();
  });

  it("disables button when loading", async () => {
    (insightService.fetchInsights as any).mockImplementation(
      () => new Promise(() => {}),
    );

    render(<PromoIdeasPage />);

    const button = screen.getByText(/Generate This Week’s Promo/i);

    fireEvent.click(button);

    expect(button.closest("button")).toBeDisabled();
  });
});
