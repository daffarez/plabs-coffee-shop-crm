"use client";

import Link from "next/link";
import { supabase } from "@/src/lib/supabase";
import { useEffect, useState } from "react";
import { Users, TrendingUp, Megaphone, ArrowRight } from "lucide-react";
import { StatCard } from "@/src/components/statcard";
import { PromoIdea } from "../promo-ideas/page";
import { ChatBotDashboard } from "@/src/components/chatbot";

type Interests = {
  name: string;
  count: number;
};

const DashboardPage = () => {
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [topInterests, setTopInterests] = useState<Interests[]>([]);
  const [suggestedPromos, setSuggestedPromos] = useState<PromoIdea[]>([]);

  const fetchAnalytics = async () => {
    // Total customers
    const { count } = await supabase
      .from("customers")
      .select("*", { count: "exact", head: true });

    setTotalCustomers(count || 0);

    // Top interests
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
  };

  useEffect(() => {
    fetchAnalytics();
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
        setSuggestedPromos([]);
      }
    }
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#2D2424] tracking-tight">
          Dashboard Overview
        </h1>
      </div>

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
                  className="text-[10px] bg-[#2D2424] text-white px-3 py-1.5 rounded-lg font-bold"
                >
                  Generate Now
                </Link>
              </div>
            )}
          </div>
        </StatCard>
      </div>

      <div className="flex flex-wrap gap-4">
        <Link
          href="/customers"
          className="flex items-center gap-2 bg-[#2D2424] text-white px-5 py-3 rounded-2xl font-bold text-sm hover:bg-[#433434] transition-all"
        >
          <Users size={18} /> Manage Customers
        </Link>
        <Link
          href="/promo-ideas"
          className="flex items-center gap-2 bg-white border border-[#EBE3D5] text-[#2D2424] px-5 py-3 rounded-2xl font-bold text-sm hover:bg-[#FDFCF8] transition-all"
        >
          <Megaphone size={18} className="text-[#D2691E]" /> Generate Promo
        </Link>
      </div>

      <div className="pt-2">
        <ChatBotDashboard />
      </div>
    </div>
  );
};

export default DashboardPage;
