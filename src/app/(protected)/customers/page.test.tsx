import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CustomerPage from "./page";
import { saveCustomer, deleteCustomer } from "@/src/services/customer.service";

vi.mock("@/src/lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockResolvedValue({ data: [], count: 0, error: null }),
      ilike: vi.fn().mockReturnThis(),
    })),
  },
}));

vi.mock("@/src/services/customer.service", () => ({
  saveCustomer: vi.fn(),
  deleteCustomer: vi.fn(),
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

vi.mock("@/src/components/customersearchfilter", () => ({
  CustomerSearchFilters: () => <div>SearchFilters</div>,
}));

vi.mock("@/src/components/customerlist", () => ({
  CustomerList: ({ onClickDeleteButton, onClickEditButton }: any) => (
    <div>
      <button onClick={() => onClickDeleteButton({ id: "1", name: "John" })}>
        TriggerDelete
      </button>
      <button
        onClick={() =>
          onClickEditButton({
            id: "1",
            name: "John",
            contact: "123",
            favorite: "Kopi",
            customer_tags: [],
          })
        }
      >
        TriggerEdit
      </button>
    </div>
  ),
}));

vi.mock("@/src/components/customerform", () => ({
  CustomerForm: ({ handleSubmit, handleChange, formData }: any) => (
    <div>
      <input
        name="name"
        onChange={handleChange}
        value={formData.name}
        placeholder="name"
      />
      <input
        name="favorite"
        onChange={handleChange}
        value={formData.favorite}
        placeholder="favorite"
      />
      <input
        name="tagsInput"
        onChange={handleChange}
        value={formData.tagsInput}
        placeholder="tags"
      />
      <button onClick={handleSubmit}>Submit</button>
    </div>
  ),
}));

vi.mock("@/src/components/confirmmodal", () => ({
  ConfirmModal: ({ onConfirm, isOpen }: any) =>
    isOpen ? <button onClick={onConfirm}>ConfirmDelete</button> : null,
}));

describe("CustomerPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders page title", () => {
    render(<CustomerPage />);
    expect(screen.getByText("Customers")).toBeInTheDocument();
  });

  it("calls saveCustomer when form valid", async () => {
    (saveCustomer as any).mockResolvedValue({ success: true });

    render(<CustomerPage />);

    fireEvent.change(screen.getByPlaceholderText("name"), {
      target: { name: "name", value: "John" },
    });

    fireEvent.change(screen.getByPlaceholderText("favorite"), {
      target: { name: "favorite", value: "Latte" },
    });

    fireEvent.change(screen.getByPlaceholderText("tags"), {
      target: { name: "tagsInput", value: "coffee" },
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

    const confirmBtn = screen.getByText("ConfirmDelete");
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(deleteCustomer).toHaveBeenCalledWith("1");
    });
  });

  it("should handle modal visibility on edit", async () => {
    render(<CustomerPage />);

    fireEvent.click(screen.getByText("TriggerEdit"));

    const nameInput = screen.getByPlaceholderText("name") as HTMLInputElement;
    expect(nameInput.value).toBe("John");
  });
});
