import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { insightService } from "./insight.service";
import { supabase } from "@/src/lib/supabase";

vi.mock("@/src/lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("getStoredPromo", () => {
  it("returns empty array if no data", () => {
    const result = insightService.getStoredPromo();
    expect(result).toEqual([]);
  });

  it("returns empty array if JSON invalid", () => {
    localStorage.setItem("latest_ai_promo", "invalid-json");
    const result = insightService.getStoredPromo();
    expect(result).toEqual([]);
  });

  it("removes expired data", () => {
    const expiredDate = Date.now() - 8 * 24 * 60 * 60 * 1000;

    localStorage.setItem(
      "latest_ai_promo",
      JSON.stringify({
        ideas: [{ theme: "old" }],
        createdAt: expiredDate,
      }),
    );

    const removeSpy = vi.spyOn(Storage.prototype, "removeItem");

    const result = insightService.getStoredPromo();

    expect(result).toEqual([]);
    expect(removeSpy).toHaveBeenCalledWith("latest_ai_promo");
  });

  it("returns stored ideas if not expired", () => {
    const validDate = Date.now();

    localStorage.setItem(
      "latest_ai_promo",
      JSON.stringify({
        ideas: [{ theme: "valid" }],
        createdAt: validDate,
      }),
    );

    const result = insightService.getStoredPromo();
    expect(result).toEqual([{ theme: "valid" }]);
  });

  it("returns empty if ideas undefined", () => {
    localStorage.setItem(
      "latest_ai_promo",
      JSON.stringify({
        createdAt: Date.now(),
      }),
    );

    const result = insightService.getStoredPromo();
    expect(result).toEqual([]);
  });
});

describe("savePromo & clearPromo", () => {
  it("saves promo to localStorage", () => {
    const setSpy = vi.spyOn(Storage.prototype, "setItem");

    insightService.savePromo([{ theme: "promo" } as any]);

    expect(setSpy).toHaveBeenCalled();
  });

  it("clears promo from localStorage", () => {
    const removeSpy = vi.spyOn(Storage.prototype, "removeItem");

    insightService.clearPromo();

    expect(removeSpy).toHaveBeenCalledWith("latest_ai_promo");
  });
});

describe("fetchInsights", () => {
  it("returns empty object on error", async () => {
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: null,
        error: "error",
      }),
    });

    const result = await insightService.fetchInsights();
    expect(result).toEqual({});
  });

  it("returns empty object if no data", async () => {
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    });

    const result = await insightService.fetchInsights();
    expect(result).toEqual({});
  });

  it("returns top 3 sorted tag counts", async () => {
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: [
          { interest_tags: { name: "coffee" } },
          { interest_tags: { name: "coffee" } },
          { interest_tags: { name: "tea" } },
          { interest_tags: { name: "cake" } },
          { interest_tags: { name: "cake" } },
          { interest_tags: { name: "cake" } },
        ],
        error: null,
      }),
    });

    const result = await insightService.fetchInsights();

    expect(result).toEqual({
      cake: 3,
      coffee: 2,
      tea: 1,
    });
  });

  it("ignores null tag names", async () => {
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: [{ interest_tags: { name: null } }, { interest_tags: null }],
        error: null,
      }),
    });

    const result = await insightService.fetchInsights();
    expect(result).toEqual({});
  });
});

describe("generatePromo", () => {
  it("calls fetch with correct params", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({ success: true }),
    }) as any;

    const result = await insightService.generatePromo({
      coffee: 5,
    });

    expect(fetch).toHaveBeenCalledWith("/api/promo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tagCounts: { coffee: 5 } }),
    });

    expect(result).toEqual({ success: true });
  });
});

describe("safeJsonParse", () => {
  it("parses valid JSON", () => {
    const result = insightService.safeJsonParse(JSON.stringify({ test: 1 }));

    expect(result).toEqual({ test: 1 });
  });

  it("parses markdown wrapped JSON", () => {
    const raw = '```json\n{ "test": 1 }\n```';

    const result = insightService.safeJsonParse(raw);

    expect(result).toEqual({ test: 1 });
  });

  it("returns empty array on invalid JSON", () => {
    const result = insightService.safeJsonParse("invalid");
    expect(result).toEqual([]);
  });

  it("returns empty array on undefined input", () => {
    const result = insightService.safeJsonParse(undefined as any);
    expect(result).toEqual([]);
  });
});
