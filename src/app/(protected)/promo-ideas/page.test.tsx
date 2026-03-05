import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const mockToast = vi.fn();

vi.mock("@/src/store/usetoaststore", () => ({
  useToastStore: () => ({
    showToast: mockToast,
  }),
}));

vi.mock("@/src/lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockResolvedValue({
        data: [
          { interest_tags: { name: "coffee" } },
          { interest_tags: { name: "coffee" } },
          { interest_tags: { name: "pastry" } },
        ],
        error: null,
      }),
    })),
  },
}));

vi.mock("@/src/components/promoidealist", () => ({
  PromoIdeaList: ({ ideas, onCopy }: any) => (
    <div>
      {ideas.map((idea: any, index: number) => (
        <button key={index} onClick={() => onCopy(idea.ready_message, index)}>
          {idea.theme}
        </button>
      ))}
    </div>
  ),
}));

vi.mock("@/src/components/confirmmodal", () => ({
  ConfirmModal: ({ isOpen, onConfirm }: any) =>
    isOpen ? <button onClick={onConfirm}>Confirm</button> : null,
}));


import PromoIdeasPage from "./page";

describe("PromoIdeasPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("renders base UI", () => {
    render(<PromoIdeasPage />);
    expect(screen.getByText("Global AI Promo")).toBeInTheDocument();
    expect(screen.getByText("Generate This Week’s Promo")).toBeInTheDocument();
  });

  it("loads valid localStorage promo", () => {
    localStorage.setItem(
      "latest_ai_promo",
      JSON.stringify({
        ideas: [{ theme: "Caramel Week", ready_message: "Hi!" }],
        createdAt: Date.now(),
      }),
    );

    render(<PromoIdeasPage />);

    expect(screen.getByText("Caramel Week")).toBeInTheDocument();
  });

  it("clears expired localStorage promo", () => {
    localStorage.setItem(
      "latest_ai_promo",
      JSON.stringify({
        ideas: [{ theme: "Old Promo", ready_message: "Hi!" }],
        createdAt: Date.now() - 8 * 24 * 60 * 60 * 1000,
      }),
    );

    render(<PromoIdeasPage />);
    expect(screen.queryByText("Old Promo")).not.toBeInTheDocument();
  });

  it("generates promo successfully", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify([
                {
                  theme: "New Promo",
                  segment_description: "coffee lovers",
                  why_now: "Trending",
                  ready_message: "Buy now!",
                },
              ]),
            },
          },
        ],
      }),
    });

    render(<PromoIdeasPage />);

    fireEvent.click(screen.getByText("Generate This Week’s Promo"));

    await waitFor(() => {
      expect(screen.getByText("New Promo")).toBeInTheDocument();
    });

    expect(localStorage.getItem("latest_ai_promo")).toBeTruthy();
  });

  it("handles wrapped AI response format", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                promotions: [
                  {
                    theme: "Wrapped Promo",
                    segment_description: "",
                    why_now: "",
                    ready_message: "Hello!",
                  },
                ],
              }),
            },
          },
        ],
      }),
    });

    render(<PromoIdeasPage />);
    fireEvent.click(screen.getByText("Generate This Week’s Promo"));

    await waitFor(() => {
      expect(screen.getByText("Wrapped Promo")).toBeInTheDocument();
    });
  });

  it("handles generate error", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("fail"));

    render(<PromoIdeasPage />);
    fireEvent.click(screen.getByText("Generate This Week’s Promo"));

    await waitFor(() => {
      expect(screen.getByText(/System failed/)).toBeInTheDocument();
      expect(mockToast).toHaveBeenCalledWith("Something went wrong.", "error");
    });
  });

  it("handles invalid AI JSON safely", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({
        choices: [
          {
            message: {
              content: "```json invalid json```",
            },
          },
        ],
      }),
    });

    render(<PromoIdeasPage />);
    fireEvent.click(screen.getByText("Generate This Week’s Promo"));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalled();
    });
  });

  it("copies promo to clipboard", async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(),
      },
    });

    localStorage.setItem(
      "latest_ai_promo",
      JSON.stringify({
        ideas: [{ theme: "Copy Me", ready_message: "Hello!" }],
        createdAt: Date.now(),
      }),
    );

    render(<PromoIdeasPage />);

    fireEvent.click(screen.getByText("Copy Me"));

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("Hello!");
  });

  it("clears promo using modal", async () => {
    localStorage.setItem(
      "latest_ai_promo",
      JSON.stringify({
        ideas: [{ theme: "Clear Me", ready_message: "Hi!" }],
        createdAt: Date.now(),
      }),
    );

    render(<PromoIdeasPage />);

    expect(await screen.findByText("Clear")).toBeInTheDocument();

    const buttons = screen.getAllByRole("button");
    const clearButton = buttons.find((btn) =>
      btn.className.includes("hover:text-red-600"),
    );

    expect(clearButton).toBeTruthy();

    fireEvent.click(clearButton!);

    const confirmBtn = await screen.findByText("Confirm");
    fireEvent.click(confirmBtn);

    expect(localStorage.getItem("latest_ai_promo")).toBeNull();
  });
});
