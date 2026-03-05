import { supabase } from "@/src/lib/supabase";

export type Interests = {
  name: string;
  count: number;
};

export const fetchAnalyticsData = async () => {
  const { count } = await supabase
    .from("customers")
    .select("*", { count: "exact", head: true });

  const { data } = await supabase.from("customer_tags").select(`
    interest_tags(name)
  `);

  let topInterests: Interests[] = [];

  if (data) {
    const counts: Record<string, number> = {};

    data.forEach((item: any) => {
      const tagName = item.interest_tags?.name;
      if (!tagName) return;
      counts[tagName] = (counts[tagName] || 0) + 1;
    });

    topInterests = Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }

  return {
    totalCustomers: count || 0,
    topInterests,
  };
};
