"use client";

import { useState } from "react";
import { supabase } from "@/src/lib/supabase";
import {
  Sparkles,
  Copy,
  Calendar,
  Target,
  Lightbulb,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

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
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const fetchInsights = async () => {
    const { data, error } = await supabase
      .from("customer_tags")
      .select(`interest_tags(name)`);

    if (error || !data) return {};

    const counts: Record<string, number> = {};
    data.forEach((item: any) => {
      const tag = item.interest_tags?.name;
      if (tag) counts[tag] = (counts[tag] || 0) + 1;
    });

    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagCounts }),
      });

      const result = await res.json();
      const aiContent = result.choices?.[0]?.message?.content;
      const parsed = safeJsonParse(aiContent);
      setIdeas(parsed);
    } catch (err) {
      setError("Oops! System failed to brew your ideas. Please try again.");
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
      return [];
    }
  };

  const copyToClipboard = (message: string, index: number) => {
    navigator.clipboard.writeText(message);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D2691E]/10 text-[#D2691E] text-xs font-bold uppercase tracking-widest mb-2">
            <Sparkles size={14} /> AI Powered Insights
          </div>
          <h1 className="text-3xl font-extrabold text-[#2D2424] tracking-tight">
            Global AI Promo
          </h1>
          <p className="text-[#7E6363] max-w-lg">
            Our AI analyzes your top customer interests to suggest
            high-conversion promo themes and messages.
          </p>
        </div>

        <button
          onClick={generatePromo}
          disabled={loading}
          className="relative group overflow-hidden bg-[#2D2424] text-white px-8 py-4 rounded-2xl font-bold transition-all hover:bg-[#433434] active:scale-95 disabled:opacity-70 shadow-xl shadow-black/10"
        >
          <span className="flex items-center gap-2 relative z-10">
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Brewing Ideas...
              </>
            ) : (
              <>
                <Lightbulb
                  size={18}
                  className="group-hover:text-yellow-400 transition-colors"
                />
                Generate This Week’s Promo
              </>
            )}
          </span>
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 animate-in fade-in slide-in-from-top-2">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {ideas.length > 0 ? (
        <div className="space-y-8 relative">
          <div className="absolute left-10 top-10 bottom-10 w-0.5 bg-[#EBE3D5] hidden md:block" />

          {ideas.map((idea, index) => (
            <div
              key={index}
              className="relative flex flex-col md:flex-row gap-8 items-start group transition-all duration-500 animate-in slide-in-from-bottom-8"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="z-10 shrink-0 w-20 h-20 rounded-4xl bg-white border-2 border-[#EBE3D5] flex items-center justify-center text-3xl font-black text-[#D2691E] shadow-sm group-hover:border-[#D2691E] group-hover:bg-[#FDFCF8] transition-all duration-300">
                0{index + 1}
              </div>

              <div className="flex-1 bg-white border border-[#EBE3D5] rounded-[2.5rem] p-8 md:p-10 shadow-sm group-hover:shadow-xl group-hover:shadow-orange-900/5 transition-all duration-300">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <h2 className="text-2xl font-black text-[#2D2424] tracking-tight">
                    {idea.theme}
                  </h2>
                  <div className="flex items-center gap-2 px-4 py-1.5 bg-[#FDFCF8] rounded-xl border border-[#EBE3D5] text-[#7E6363] text-xs font-bold">
                    <Calendar size={14} className="text-[#D2691E]" />
                    {idea.best_time_window || "Anytime"}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[#D2691E] text-[10px] font-black uppercase tracking-widest">
                      <Target size={14} /> Target
                    </div>
                    <p className="text-[#7E6363] text-sm leading-relaxed">
                      {idea.segment_description}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[#D2691E] text-[10px] font-black uppercase tracking-widest">
                      <Lightbulb size={14} /> Why now?
                    </div>
                    <p className="text-[#7E6363] text-sm leading-relaxed">
                      {idea.why_now}
                    </p>
                  </div>
                </div>

                <div className="relative overflow-hidden bg-[#2D2424] rounded-2xl p-6 text-white group/msg transition-all">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2 text-white/50">
                      <MessageSquare size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        Marketing Copy
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(idea.ready_message, index)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-all"
                    >
                      {copiedIndex === index ? (
                        <CheckCircle2 size={18} className="text-green-400" />
                      ) : (
                        <Copy size={18} className="text-white/70" />
                      )}
                    </button>
                  </div>
                  <p className="text-lg font-medium leading-relaxed italic pr-8">
                    "{idea.ready_message}"
                  </p>

                  {copiedIndex === index && (
                    <div className="absolute top-4 right-14 bg-green-500 text-[10px] font-bold py-1 px-3 rounded-full animate-in fade-in slide-in-from-right-2">
                      COPIED!
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        !loading && (
          <div className="py-20 text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-[#FDFCF8] rounded-full flex items-center justify-center text-[#EBE3D5]">
              <Sparkles size={40} />
            </div>
            <p className="text-[#7E6363] font-medium italic">
              Ready to grow? Generate your top 3 strategies for this week.
            </p>
          </div>
        )
      )}
    </div>
  );
};

export default PromoIdeasPage;
