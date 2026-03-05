import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/src/lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { supabase } from "@/src/lib/supabase";
import { fetchAnalyticsData } from "./analytics.service";

describe("fetchAnalyticsData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns total and sorted interests", async () => {
    (supabase.from as any).mockImplementation((table: string) => {
      if (table === "customers") {
        return {
          select: vi.fn().mockResolvedValue({ count: 3 }),
        };
      }

      if (table === "customer_tags") {
        return {
          select: vi.fn().mockResolvedValue({
            data: [
              { interest_tags: { name: "coffee" } },
              { interest_tags: { name: "coffee" } },
              { interest_tags: { name: "tea" } },
            ],
          }),
        };
      }
    });

    const result = await fetchAnalyticsData();

    expect(result.totalCustomers).toBe(3);
    expect(result.topInterests).toEqual([
      { name: "coffee", count: 2 },
      { name: "tea", count: 1 },
    ]);
  });

  it("returns empty interests when data null", async () => {
    (supabase.from as any).mockImplementation((table: string) => {
      if (table === "customers") {
        return {
          select: vi.fn().mockResolvedValue({ count: 1 }),
        };
      }

      if (table === "customer_tags") {
        return {
          select: vi.fn().mockResolvedValue({ data: null }),
        };
      }
    });

    const result = await fetchAnalyticsData();

    expect(result.topInterests).toEqual([]);
  });

  it("handles missing tag names", async () => {
    (supabase.from as any).mockImplementation((table: string) => {
      if (table === "customers") {
        return {
          select: vi.fn().mockResolvedValue({ count: 1 }),
        };
      }

      if (table === "customer_tags") {
        return {
          select: vi.fn().mockResolvedValue({
            data: [{ interest_tags: null }],
          }),
        };
      }
    });

    const result = await fetchAnalyticsData();
    expect(result.topInterests).toEqual([]);
  });
});
