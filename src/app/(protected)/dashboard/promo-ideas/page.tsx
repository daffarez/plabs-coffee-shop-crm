"use client";

import { useState } from "react";
import { supabase } from "@/src/lib/supabase";

type PromoIdea = {
  theme: string;
  segment_description: string;
  why_now: string;
  ready_message: string;
  best_time_window?: string;
};

const PromoIdeasPage = () => {
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState<PromoIdea[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
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
      .slice(0, 3) // Top 3
      .reduce(
        (obj, [key, value]) => {
          obj[key] = value;
          return obj;
        },
        {} as Record<string, number>,
      );
  };

  const generatePromo = async () => {
    try {
      setLoading(true);
      setError(null);

      const tagCounts = await fetchInsights();

      const res = await fetch("/api/ai-promo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tagCounts }),
      });

      const result = await res.json();
      const aiContent = result.choices?.[0]?.message?.content;
      const parsed = safeJsonParse(aiContent);

      setIdeas(parsed);
    } catch (err) {
      console.log("err", err);
      setError("Failed to generate promo ideas.");
    } finally {
      setLoading(false);
    }
  };

  const safeJsonParse = (rawString: string) => {
    try {
      const cleanString = rawString
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      return JSON.parse(cleanString);
    } catch (error) {
      console.error("Gagal parse JSON dari AI:", error);
      return [];
    }
  };

  const copyMessage = (message: string) => {
    navigator.clipboard.writeText(message);
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Global AI Promo</h1>
        <p className="text-sm text-gray-500 mt-1">
          Generate this week’s promo ideas based on customer interest trends.
        </p>
      </div>

      <button
        onClick={generatePromo}
        className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate This Week’s Promo"}
      </button>

      {error && (
        <div className="rounded-md border border-red-300 bg-red-100 px-4 py-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      {ideas.length > 0 && (
        <div className="grid gap-6">
          {ideas.map((idea, index) => (
            <div key={index} className="bg-white shadow rounded p-6 space-y-3">
              <h2 className="text-lg font-semibold">Theme: {idea.theme}</h2>

              <div className="text-sm">
                <strong>Segment:</strong> {idea.segment_description}
              </div>

              <div className="text-sm">
                <strong>Why now:</strong> {idea.why_now}
              </div>

              <div className="text-sm">
                <strong>Best time:</strong>{" "}
                {idea.best_time_window || "Not specified"}
              </div>

              <div className="bg-gray-50 p-3 rounded text-sm">
                <strong>Message:</strong>
                <p className="mt-1">{idea.ready_message}</p>
              </div>

              <button
                onClick={() => copyMessage(idea.ready_message)}
                className="text-sm text-blue-600 hover:underline"
              >
                Copy Message
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PromoIdeasPage;
