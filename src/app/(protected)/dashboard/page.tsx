"use client";

import Link from "next/link";
import { supabase } from "@/src/lib/supabase";
import { useEffect, useState } from "react";
import { Users, TrendingUp, Megaphone, ArrowRight } from "lucide-react";

type Interests = {
  name: string;
  count: number;
};

const DashboardPage = () => {
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [topInterests, setTopInterests] = useState<Interests[]>([]);

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-[#2D2424] tracking-tight">
          Dashboard Overview
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-[#EBE3D5] p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Users size={20} />
            </div>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-1 rounded">
              Lifetime
            </span>
          </div>
          <p className="text-sm font-medium text-[#7E6363]">Total Customers</p>
          <p className="text-3xl font-bold text-[#2D2424] mt-1">
            {totalCustomers}
          </p>
        </div>

        <div className="bg-white border border-[#EBE3D5] p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-50 rounded-lg text-[#D2691E]">
              <TrendingUp size={20} />
            </div>
            <span className="text-[10px] font-bold text-[#D2691E] uppercase tracking-wider bg-orange-50 px-2 py-1 rounded">
              Popular
            </span>
          </div>
          <p className="text-sm font-medium text-[#7E6363] mb-3">
            Top Interests
          </p>
          <div className="space-y-2">
            {topInterests.map((item, index) => (
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
        </div>

        <div className="bg-white border border-[#EBE3D5] p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#D2691E]/5 rounded-full -mr-8 -mt-8" />
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <Megaphone size={20} />
            </div>
          </div>
          <p className="text-sm font-medium text-[#7E6363]">
            Suggested Campaign
          </p>
          <p className="mt-2 text-[#2D2424] font-bold leading-snug">
            Oat Milk & Sweet Drinks Bundle Promo
          </p>
          <p className="text-[10px] text-[#7E6363] mt-2 italic">
            *Based on recent trends
          </p>
        </div>
      </div>

      <div className="pt-4">
        <Link
          href="/dashboard/customers"
          className="group inline-flex items-center gap-2 bg-[#2D2424] text-[#FDFCF8] px-6 py-3 rounded-xl font-bold hover:bg-[#433434] transition-all shadow-lg shadow-brown-900/20"
        >
          Manage Customers
          <ArrowRight
            size={18}
            className="group-hover:translate-x-1 transition-transform"
          />
        </Link>
      </div>
    </div>
  );
};

export default DashboardPage;
