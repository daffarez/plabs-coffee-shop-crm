"use client";

import Link from "next/link";
import { supabase } from "@/src/lib/supabase";
import { useEffect, useState } from "react";
import {
  Users,
  TrendingUp,
  Megaphone,
  ArrowRight,
  Copy,
  Check,
} from "lucide-react";
import { StatCard } from "@/src/components/statcard";
import { PromoIdea } from "../promo-ideas/page";
import { ChatBotDashboard } from "@/src/components/chatbot";
import { useLoadingStore } from "@/src/store/useloadingstore";
import { useToastStore } from "@/src/store/usetoaststore";

type Interests = {
  name: string;
  count: number;
};

const DashboardPage = () => {
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [topInterests, setTopInterests] = useState<Interests[]>([]);
  const [suggestedPromos, setSuggestedPromos] = useState<PromoIdea[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const { startLoading, stopLoading } = useLoadingStore();
  const { showToast } = useToastStore();

  const fetchAnalytics = async () => {
    try {
      const { count } = await supabase
        .from("customers")
        .select("*", { count: "exact", head: true });

      setTotalCustomers(count || 0);

      const { data } = await supabase.from("customer_tags").select(`
        interest_tags(name)
      `);

      if (data) {
        const counts: Record<string, number> = {};
        data.forEach((item: any) => {
          const tagName = item.interest_tags?.name;
          if (!tagName) return;
          counts[tagName] = (counts[tagName] || 0) + 1;
        });

        const sorted = Object.entries(counts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 3);

        setTopInterests(sorted);
      }
    } catch (err) {
      console.error("Error fetch analytic data:", err);
      showToast("Something went wrong.", "error");
    }
  };

  const handleCopyPromo = async (text: string, id: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      showToast("Promo copied to clipboard!", "success");
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      showToast("Failed to copy text.", "error");
    }
  };

  useEffect(() => {
    const init = async () => {
      startLoading("Gathering insights...");
      await fetchAnalytics();
      setHasLoaded(true);
      stopLoading();
    };
    init();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("latest_ai_promo");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.ideas) && parsed.ideas.length > 0) {
          setSuggestedPromos(parsed.ideas);
        }
      } catch (e) {
        console.error("Error parsing dashboard promo:", e);
        showToast("Something went wrong.", "error");
        setSuggestedPromos([]);
      }
    }
  }, []);

  if (!hasLoaded) return <div className="min-h-screen bg-[#FDFCF8]" />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#2D2424] tracking-tight">
          Dashboard Overview
        </h1>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Customers"
          icon={Users}
          iconColorClass="text-blue-600"
          bgColorClass="bg-blue-50"
          badgeText="Lifetime"
          badgeColorClass="text-blue-600 bg-blue-50"
        >
          <p className="text-3xl font-bold text-[#2D2424]">{totalCustomers}</p>
        </StatCard>

        <StatCard title="Top Interests" icon={TrendingUp} badgeText="Popular">
          <div className="space-y-2 mt-2">
            {topInterests.map((item) => (
              <div
                key={item.name}
                className="flex justify-between items-center text-sm"
              >
                <span className="text-[#2D2424] font-medium flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D2691E]/40" />
                  {item.name}
                </span>
                <span className="text-[#7E6363] font-bold bg-[#FDFCF8] px-2 py-0.5 rounded border border-[#EBE3D5]">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </StatCard>

        <StatCard
          title="Suggested Campaign"
          icon={Megaphone}
          iconColorClass="text-purple-600"
          bgColorClass="bg-purple-50"
          isRelative={true}
        >
          <div className="mt-2 min-h-15">
            {suggestedPromos.length > 0 ? (
              <>
                <p className="text-[#2D2424] font-bold leading-tight line-clamp-2">
                  {suggestedPromos[0].theme}
                </p>
                <p className="text-[10px] text-[#7E6363] mt-2 italic line-clamp-1">
                  Target: {suggestedPromos[0].segment_description}
                </p>
                <Link
                  href="/promo-ideas"
                  className="mt-3 inline-flex items-center gap-1 text-[10px] font-black text-[#D2691E] uppercase hover:gap-2 transition-all"
                >
                  View All <ArrowRight size={10} />
                </Link>
              </>
            ) : (
              <div className="flex flex-col py-2">
                <p className="text-[10px] text-[#7E6363] italic mb-2">
                  No promo ideas yet.
                </p>
                <Link
                  href="/promo-ideas"
                  className="text-[10px] bg-[#2D2424] text-white px-3 py-1.5 rounded-lg font-bold text-center"
                >
                  Generate Now
                </Link>
              </div>
            )}
          </div>
        </StatCard>
      </div>

      <div className="bg-white rounded-4xl p-6 border border-[#EBE3D5] shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-[#FDFCF8] rounded-xl border border-[#EBE3D5]">
            <Megaphone size={18} className="text-[#D2691E]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#2D2424]">Quick Links</h3>
            <p className="text-xs text-[#7E6363]">
              Copy and share your latest AI promo ideas
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {suggestedPromos.length > 0 ? (
            suggestedPromos.map((promo, index) => (
              <button
                key={index}
                onClick={() =>
                  handleCopyPromo(promo.theme || promo.ready_message, index)
                }
                className="flex flex-col text-left p-4 rounded-2xl border border-[#EBE3D5] bg-[#FDFCF8] hover:bg-white hover:border-[#D2691E] hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black uppercase tracking-tighter text-[#D2691E]/60">
                    AI Suggestion {index + 1}
                  </span>
                  {copiedId === index ? (
                    <Check size={14} className="text-green-500" />
                  ) : (
                    <Copy
                      size={14}
                      className="text-[#7E6363] group-hover:text-[#D2691E]"
                    />
                  )}
                </div>
                <h4 className="font-bold text-sm text-[#2D2424] mb-1 truncate w-full">
                  {promo.theme}
                </h4>
                <p className="text-[11px] text-[#7E6363] line-clamp-3 italic leading-relaxed">
                  "{promo.ready_message || "Click to copy this promo idea."}"
                </p>
              </button>
            ))
          ) : (
            <div className="col-span-1 md:col-span-3 py-6 text-center border-2 border-dashed border-[#EBE3D5] rounded-3xl">
              <p className="text-sm text-[#7E6363] mb-3">
                No AI promos found in your local storage.
              </p>
              <Link
                href="/promo-ideas"
                className="inline-flex items-center gap-2 text-xs bg-[#2D2424] text-white px-4 py-2 rounded-xl font-bold hover:bg-[#433434] transition-colors"
              >
                Generate Promo with AI <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="pt-2">
        <ChatBotDashboard />
      </div>
    </div>
  );
};

export default DashboardPage;
