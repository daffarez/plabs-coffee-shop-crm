import { describe, it, expect, vi, beforeEach } from "vitest";
vi.mock("@/src/lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

vi.mock("@/src/services/customer.service", () => ({
  saveCustomer: vi.fn(),
  deleteCustomer: vi.fn(),
}));
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CustomerPage from "./page";
import { saveCustomer, deleteCustomer } from "@/src/services/customer.service";

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

vi.mock("@/src/components/customersearchfilter", () => ({
  CustomerSearchFilters: () => <div>SearchFilters</div>,
}));

vi.mock("@/src/components/customerlist", () => ({
  CustomerList: ({ onClickDeleteButton }: any) => (
    <button
      onClick={() =>
        onClickDeleteButton({
          id: "1",
          name: "John",
          contact: "",
          favorite: "",
          customer_tags: [],
        })
      }
    >
      TriggerDelete
    </button>
  ),
}));

vi.mock("@/src/components/customerform", () => ({
  CustomerForm: ({ handleSubmit, handleChange }: any) => (
    <div>
      <input name="name" onChange={handleChange} placeholder="name" />
      <input name="favorite" onChange={handleChange} placeholder="favorite" />
      <input name="tagsInput" onChange={handleChange} placeholder="tags" />
      <button onClick={handleSubmit}>Submit</button>
    </div>
  ),
}));

vi.mock("@/src/components/confirmmodal", () => ({
  ConfirmModal: ({ onConfirm }: any) => (
    <button onClick={onConfirm}>ConfirmDelete</button>
  ),
}));

describe("CustomerPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders page title", () => {
    render(<CustomerPage />);
    expect(screen.getByText("Customers")).toBeInTheDocument();
  });

  it("prevents submit when validation fails", async () => {
    render(<CustomerPage />);
    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(saveCustomer).not.toHaveBeenCalled();
    });
  });

  it("calls saveCustomer when form valid", async () => {
    (saveCustomer as any).mockResolvedValue("123");

    render(<CustomerPage />);

    fireEvent.change(screen.getByPlaceholderText("name"), {
      target: { value: "John" },
    });

    fireEvent.change(screen.getByPlaceholderText("favorite"), {
      target: { value: "Latte" },
    });

    fireEvent.change(screen.getByPlaceholderText("tags"), {
      target: { value: "coffee" },
    });

    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(saveCustomer).toHaveBeenCalled();
    });
  });

  it("calls deleteCustomer on confirm", async () => {
    (deleteCustomer as any).mockResolvedValue(undefined);

    render(<CustomerPage />);

    fireEvent.click(screen.getByText("TriggerDelete"));
    fireEvent.click(screen.getByText("ConfirmDelete"));

    await waitFor(() => {
      expect(deleteCustomer).toHaveBeenCalledWith("1");
    });
  });

  it("should debounce search input", async () => {
    vi.useFakeTimers();

    render(<CustomerPage />);

    const input = screen.getByPlaceholderText("name");

    fireEvent.change(input, {
      target: { name: "name", value: "abc" },
    });

    expect(saveCustomer).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);

    await vi.runAllTimersAsync?.();

    vi.useRealTimers();
  });
});
