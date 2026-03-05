import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import LoginPage from "./page";
import { supabase } from "@/src/lib/supabase";
import { useRouter } from "next/navigation";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    refresh: vi.fn(),
    push: vi.fn(),
  })),
}));

vi.mock("@/src/lib/supabase", () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
    },
  },
}));

vi.mock("@/src/store/useloadingstore", () => ({
  useLoadingStore: () => ({
    startLoading: vi.fn(),
    stopLoading: vi.fn(),
  }),
}));

vi.mock("@/src/store/usetoaststore", () => ({
  useToastStore: () => ({
    showToast: vi.fn(),
  }),
}));

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders login form correctly", () => {
    render(<LoginPage />);
    expect(screen.getByText(/Sign In to Dashboard/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("name@coffee.com")).toBeInTheDocument();
  });

  it("handles successful login and refreshes page", async () => {
    const mockRefresh = vi.fn();
    (useRouter as any).mockReturnValue({ refresh: mockRefresh, push: vi.fn() });

    (supabase.auth.signInWithPassword as any).mockResolvedValue({
      data: { user: { id: "123" } },
      error: null,
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("name@coffee.com"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "password123" },
    });

    const submitBtn = screen.getByRole("button", {
      name: /Sign In to Dashboard/i,
    });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("displays error message on invalid credentials", async () => {
    (supabase.auth.signInWithPassword as any).mockResolvedValue({
      data: null,
      error: { message: "Invalid login credentials" },
    });

    render(<LoginPage />);

    const submitBtn = screen.getByRole("button", {
      name: /Sign In to Dashboard/i,
    });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/Invalid username or password/i),
      ).toBeInTheDocument();
    });
  });
});
