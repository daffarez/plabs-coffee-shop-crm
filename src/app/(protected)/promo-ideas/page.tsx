"use client";

import { useEffect, useState } from "react";
import { Sparkles, Lightbulb, AlertCircle, Info, Trash2 } from "lucide-react";
import { ConfirmModal } from "@/src/components/confirmmodal";
import { PromoIdeaList } from "@/src/components/promoidealist";
import { useToastStore } from "@/src/store/usetoaststore";
import { insightService } from "@/src/services/insight.service";
import { useLoadingStore } from "@/src/store/useloadingstore";

export type PromoIdea = {
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
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  const { showToast } = useToastStore();
  const { startLoading, stopLoading } = useLoadingStore();

  useEffect(() => {
    startLoading();

    const timer = setTimeout(() => {
      const storedIdeas = insightService.getStoredPromo();
      setIdeas(storedIdeas);
      stopLoading();
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const generatePromo = async () => {
    try {
      setLoading(true);
      setError(null);

      const tagCounts = await insightService.fetchInsights();
      const result = await insightService.generatePromo(tagCounts);

      const aiContent = result.choices?.[0]?.message?.content;
      const parsed = insightService.safeJsonParse(aiContent);

      let validatedIdeas: PromoIdea[] = [];

      if (Array.isArray(parsed)) {
        validatedIdeas = parsed;
      } else if (parsed?.promotions) {
        validatedIdeas = parsed.promotions;
      } else if (typeof parsed === "object") {
        const firstKey = Object.keys(parsed)[0];
        if (Array.isArray(parsed[firstKey])) {
          validatedIdeas = parsed[firstKey];
        }
      }

      if (validatedIdeas.length > 0) {
        setIdeas(validatedIdeas);
        insightService.savePromo(validatedIdeas);
      }
    } catch {
      setError("Oops! System failed to brew your ideas. Please try again.");
      showToast("Something went wrong.", "error");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (message: string, index: number) => {
    navigator.clipboard.writeText(message);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const clearPromoIdeaData = () => {
    insightService.clearPromo();
    setIdeas([]);
    setIsClearModalOpen(false);
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D2691E]/10 text-[#D2691E] text-xs font-bold uppercase tracking-widest mb-2">
            <Sparkles size={14} /> AI Powered Insights
          </div>
          <h1 className="text-3xl font-bold text-[#2D2424] tracking-tight">
            Global AI Promo
          </h1>
          <p className="text-[#7E6363] max-w-lg">
            Our AI analyzes your top customer interests to suggest promo themes
            and messages.
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-3">
            {ideas.length > 0 && (
              <button
                onClick={() => setIsClearModalOpen(true)}
                className="flex items-center justify-center w-13 h-13 md:w-auto md:px-5 rounded-2xl font-bold text-[#7E6363] hover:text-red-600 hover:bg-red-50 border border-[#EBE3D5] hover:border-red-200 transition-all active:scale-95"
              >
                <Trash2 size={20} className="md:mr-2" />
                <span className="hidden md:inline">Clear</span>
              </button>
            )}

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
          <div className="flex items-center gap-1.5 text-[10px] text-[#7E6363]/70 font-medium italic mr-2">
            <Info size={12} />
            Promos are automatically cleared every 7 days
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 animate-in fade-in slide-in-from-top-2">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <PromoIdeaList
        ideas={ideas}
        loading={loading}
        copiedIndex={copiedIndex}
        onCopy={copyToClipboard}
      />

      <ConfirmModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={clearPromoIdeaData}
        title="Clear Promo Idea?"
        description="This action will delete all promo suggestions for this week. You will need to regenerate to see new ideas."
        confirmText="Yes, Clear All"
      />
    </div>
  );
};

export default PromoIdeasPage;
