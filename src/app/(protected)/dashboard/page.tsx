"use client";

import Link from "next/link";
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
import {
  fetchAnalyticsData,
  Interests,
} from "@/src/services/analytics.service";

const DashboardPage = () => {
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [topInterests, setTopInterests] = useState<Interests[]>([]);
  const [suggestedPromos, setSuggestedPromos] = useState<PromoIdea[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const { startLoading, stopLoading } = useLoadingStore();
  const { showToast } = useToastStore();

  const loadAnalytics = async () => {
    try {
      const result = await fetchAnalyticsData();
      setTotalCustomers(result.totalCustomers);
      setTopInterests(result.topInterests);
    } catch (err) {
      console.error(err);
      showToast("Something went wrong.", "error");
    }
  };

  const handleCopyPromo = async (text: string, id: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      showToast("Promo copied to clipboard!", "success");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      showToast("Failed to copy text.", "error");
    }
  };

  useEffect(() => {
    const init = async () => {
      startLoading("Gathering insights...");
      await loadAnalytics();
      setHasLoaded(true);
      stopLoading();
    };
    init();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("latest_ai_promo");
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      if (parsed?.ideas?.length) {
        setSuggestedPromos(parsed.ideas);
      }
    } catch {
      showToast("Something went wrong.", "error");
    }
  }, []);

  if (!hasLoaded) return <div className="min-h-screen bg-[#FDFCF8]" />;

  return (
    <div className="space-y-10 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2D2424] tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm text-[#7E6363] mt-1">
            Monitoring your coffee shop activity
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Customers"
          icon={Users}
          iconColorClass="text-[#D2691E]"
          bgColorClass="bg-[#FDFCF8] border-[#EBE3D5]"
          badgeText="Lifetime"
        >
          <p className="text-4xl font-bold text-[#2D2424] mt-2 tracking-tighter">
            {totalCustomers}
          </p>
        </StatCard>

        <StatCard
          title="Top Interests"
          icon={TrendingUp}
          iconColorClass="text-[#D2691E]"
          badgeText="Popular"
        >
          <div className="space-y-3 mt-4">
            {topInterests.map((item) => (
              <div key={item.name} className="flex flex-col gap-1">
                <div className="flex justify-between text-sm">
                  <span className="text-[#7E6363] font-medium">
                    {item.name}
                  </span>
                  <span className="font-bold text-[#2D2424]">{item.count}</span>
                </div>
                <div className="w-full bg-[#EBE3D5]/30 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#D2691E] h-full rounded-full transition-all duration-500"
                    style={{ width: `${(item.count / totalCustomers) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </StatCard>

        <StatCard
          title="Suggested Campaign"
          icon={Megaphone}
          iconColorClass="text-[#D2691E]"
        >
          <div className="mt-4 flex flex-col h-full justify-between">
            {suggestedPromos.length ? (
              <div className="p-4 bg-[#FDFCF8] border border-[#EBE3D5] rounded-xl">
                <p className="font-bold text-[#2D2424] text-lg leading-tight">
                  {suggestedPromos[0].theme}
                </p>
                <Link
                  href="/promo-ideas"
                  className="text-xs text-[#D2691E] font-bold mt-3 flex items-center gap-1 hover:underline"
                >
                  View All Ideas <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <Link
                href="/promo-ideas"
                className="inline-flex items-center justify-center p-4 border-2 border-dashed border-[#EBE3D5] rounded-xl text-[#7E6363] hover:border-[#D2691E] hover:text-[#D2691E] transition-all font-medium"
              >
                + Generate Promo
              </Link>
            )}
          </div>
        </StatCard>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-[#2D2424] flex items-center gap-2">
          Quick Links
        </h2>
        <div className="grid md:grid-cols-3 gap-5">
          {suggestedPromos.map((promo, index) => (
            <button
              key={index}
              onClick={() => handleCopyPromo(promo.ready_message, index)}
              className="group relative p-5 bg-white border border-[#EBE3D5] rounded-2xl text-left hover:border-[#D2691E] hover:shadow-lg hover:shadow-orange-900/5 transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <Megaphone size={20} className="text-[#D2691E]" />
                <div className="text-[#D2691E] opacity-0 group-hover:opacity-100 transition-opacity">
                  {copiedId === index ? (
                    <Check size={18} />
                  ) : (
                    <Copy size={18} />
                  )}
                </div>
              </div>
              <p className="font-bold text-[#2D2424] mb-2">{promo.theme}</p>
              <p className="text-sm text-[#7E6363] italic leading-relaxed">
                "{promo.ready_message}"
              </p>
              <div className="mt-4 text-[10px] text-[#D2691E] font-bold uppercase opacity-0 group-hover:opacity-100 transition-all">
                Click to copy message
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="pt-6 border-t border-[#EBE3D5]">
        <ChatBotDashboard />
      </div>
    </div>
  );
};

export default DashboardPage;
