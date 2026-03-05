import { describe, it, expect, vi, beforeEach } from "vitest";
import { parseTags, saveCustomer, deleteCustomer } from "./customer.service";
import { supabase } from "@/src/lib/supabase";

vi.mock("@/src/lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe("Customer Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("parseTags should split correctly", () => {
    expect(parseTags("coffee, latte")).toEqual(["coffee", "latte"]);
  });

  it("saveCustomer should insert new customer", async () => {
    const mockSingle = vi.fn().mockResolvedValue({
      data: { id: "123" },
      error: null,
    });

    const mockSelect = vi.fn(() => ({
      single: mockSingle,
    }));

    const mockInsert = vi.fn(() => ({
      select: mockSelect,
    }));

    const mockDelete = vi.fn(() => ({
      eq: vi.fn().mockResolvedValue({ error: null }),
    }));

    const mockFrom = vi.fn((table: string) => {
      if (table === "customers") {
        return { insert: mockInsert };
      }

      if (table === "customer_tags") {
        return {
          delete: mockDelete,
          insert: vi.fn().mockResolvedValue({ error: null }),
        };
      }

      if (table === "interest_tags") {
        return {
          select: vi.fn().mockResolvedValue({ data: [], error: null }),
        };
      }

      return {};
    });

    (supabase.from as any).mockImplementation(mockFrom);

    const id = await saveCustomer({
      name: "John",
      contact: "08123",
      favorite: "Latte",
      tagsInput: "",
    });

    expect(id).toBe("123");
    expect(mockInsert).toHaveBeenCalled();
  });

  it("deleteCustomer should call supabase delete", async () => {
    const mockDelete = vi.fn(() => ({
      eq: vi.fn().mockResolvedValue({ error: null }),
    }));

    (supabase.from as any).mockReturnValue({
      delete: mockDelete,
    });

    await deleteCustomer("123");

    expect(mockDelete).toHaveBeenCalled();
  });
});
