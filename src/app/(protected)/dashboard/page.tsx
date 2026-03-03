"use client";

import Link from "next/link";
import { supabase } from "@/src/lib/supabase";
import { useEffect, useState } from "react";

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
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard Overview</h1>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white shadow p-6 rounded">
          <p className="text-sm text-gray-500">Total Customers</p>
          <p className="text-2xl font-bold mt-2">{totalCustomers}</p>
        </div>

        <div className="bg-white shadow p-6 rounded">
          <p className="text-sm text-gray-500">Top Interests</p>
          <div className="mt-2 space-y-1">
            {topInterests.map((item) => (
              <div key={item.name} className="flex justify-between text-sm">
                <span>{item.name}</span>
                <span className="font-semibold">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white shadow p-6 rounded">
          <p className="text-sm text-gray-500">Suggested Campaign</p>
          <p className="mt-2 text-sm">Oat Milk & Sweet Drinks Bundle Promo</p>
        </div>
      </div>

      <Link
        href="/dashboard/customers"
        className="inline-block mt-4 bg-black text-white px-4 py-2 rounded"
      >
        Manage Customers
      </Link>
    </div>
  );
};

export default DashboardPage;
