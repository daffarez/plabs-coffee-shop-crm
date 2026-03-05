import { supabase } from "@/src/lib/supabase";

export type PromoIdea = {
  theme: string;
  segment_description: string;
  why_now: string;
  ready_message: string;
  best_time_window?: string;
};

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

export const insightService = {
  getStoredPromo(): PromoIdea[] {
    const saved = localStorage.getItem("latest_ai_promo");
    if (!saved) return [];

    try {
      const { ideas, createdAt } = JSON.parse(saved);
      const isExpired = Date.now() - createdAt > SEVEN_DAYS;

      if (isExpired) {
        localStorage.removeItem("latest_ai_promo");
        return [];
      }

      return ideas ?? [];
    } catch {
      return [];
    }
  },

  savePromo(ideas: PromoIdea[]) {
    localStorage.setItem(
      "latest_ai_promo",
      JSON.stringify({
        ideas,
        createdAt: Date.now(),
      }),
    );
  },

  clearPromo() {
    localStorage.removeItem("latest_ai_promo");
  },

  async fetchInsights(): Promise<Record<string, number>> {
    const { data, error } = await supabase
      .from("customer_tags")
      .select(`interest_tags(name)`);

    if (error || !data) return {};

    const counts: Record<string, number> = {};

    data.forEach((item: any) => {
      const tag = item.interest_tags?.name;
      if (tag) {
        counts[tag] = (counts[tag] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .reduce(
        (acc, [key, value]) => {
          acc[key] = value;
          return acc;
        },
        {} as Record<string, number>,
      );
  },

  async generatePromo(tagCounts: Record<string, number>) {
    const res = await fetch("/api/promo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tagCounts }),
    });

    const result = await res.json();
    return result;
  },

  safeJsonParse(rawString: string) {
    try {
      const clean = rawString
        ?.replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      return JSON.parse(clean);
    } catch {
      return [];
    }
  },
};
