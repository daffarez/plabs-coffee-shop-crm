import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ChatBotDashboard } from "./chatbot";

global.fetch = vi.fn();

describe("ChatBotDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("toggles expansion when focused", async () => {
    render(<ChatBotDashboard />);

    const input = screen.getByPlaceholderText(/Ask/i);

    fireEvent.focus(input);

    await waitFor(() => {
      expect(screen.getByText(/AI Assistant/i)).toBeInTheDocument();
    });
  });

  it("sends message and updates UI with response", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "AI Response" } }],
      }),
    });

    render(<ChatBotDashboard />);
    const input = screen.getByPlaceholderText(/Ask AI Assistant/i);

    fireEvent.change(input, { target: { value: "Test message" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    expect(screen.getByText("Test message")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("AI Response")).toBeInTheDocument();
    });
  });

  it("handles empty input and expand toggle", () => {
    render(<ChatBotDashboard />);

    const buttons = screen.getAllByRole("button");
    const toggleBtn = buttons[1];

    fireEvent.click(toggleBtn);
  });

  it("disables send button when input is empty", () => {
    render(<ChatBotDashboard />);
    const buttons = screen.getAllByRole("button");
    const sendBtn = buttons[0]; // Tombol Send (dengan icon Send)

    expect(sendBtn).toBeDisabled();
  });
});
