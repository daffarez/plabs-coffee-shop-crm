"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";

type Customer = {
  id: string;
  name: string;
  contact: string | null;
  favorite: string | null;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [name, setName] = useState("");

  const fetchCustomers = async () => {
    const { data } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setCustomers(data);
  };

  const addCustomer = async () => {
    if (!name) return;

    await supabase.from("customers").insert({ name });

    setName("");
    fetchCustomers();
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Customers</h1>

      <div className="flex gap-2">
        <input
          className="border p-2"
          placeholder="Customer name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={addCustomer} className="bg-black text-white px-4">
          Add
        </button>
      </div>

      <div className="space-y-2">
        {customers.map((c) => (
          <div key={c.id} className="border p-3">
            {c.name}
          </div>
        ))}
      </div>
    </div>
  );
}
