import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import LoginPage from "./page";
import { supabase } from "@/src/lib/supabase";

vi.mock("@/src/lib/supabase", () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
    },
  },
}));

const pushMock = vi.fn();
const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("LoginPage", () => {
  it("logs in successfully and redirects", async () => {
    (supabase.auth.signInWithPassword as any).mockResolvedValue({
      data: { user: {} },
      error: null,
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("name@coffee.com"), {
      target: { value: "test@mail.com" },
    });

    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByText("Sign In to Dashboard"));

    await screen.findByText("Brewing...");

    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: "test@mail.com",
      password: "password123",
    });

    expect(refreshMock).toHaveBeenCalled();

    await new Promise((r) => setTimeout(r, 350));

    expect(pushMock).toHaveBeenCalledWith("/dashboard");
  });

  it("shows error when auth fails", async () => {
    (supabase.auth.signInWithPassword as any).mockResolvedValue({
      data: null,
      error: { message: "Invalid" },
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("name@coffee.com"), {
      target: { value: "wrong@mail.com" },
    });

    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "wrongpass" },
    });

    fireEvent.click(screen.getByText("Sign In to Dashboard"));

    await screen.findByText("Invalid username or password.");

    expect(pushMock).not.toHaveBeenCalled();
  });

  it("shows unexpected error on exception", async () => {
    (supabase.auth.signInWithPassword as any).mockRejectedValue(
      new Error("network error"),
    );

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("name@coffee.com"), {
      target: { value: "test@mail.com" },
    });

    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByText("Sign In to Dashboard"));

    await screen.findByText("An unexpected error occurred.");
  });

  it("submits when pressing Enter key", async () => {
    (supabase.auth.signInWithPassword as any).mockResolvedValue({
      data: { user: {} },
      error: null,
    });

    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText("name@coffee.com");

    fireEvent.change(emailInput, {
      target: { value: "test@mail.com" },
    });

    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "password123" },
    });

    fireEvent.keyDown(emailInput, {
      key: "Enter",
      code: "Enter",
    });

    await screen.findByText("Brewing...");

    expect(supabase.auth.signInWithPassword).toHaveBeenCalled();
  });

  it("disables button while loading", async () => {
    (supabase.auth.signInWithPassword as any).mockImplementation(
      () => new Promise(() => {}),
    );

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("name@coffee.com"), {
      target: { value: "test@mail.com" },
    });

    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByText("Sign In to Dashboard"));

    const button = screen.getByRole("button");

    expect(button).toBeDisabled();
  });
});
