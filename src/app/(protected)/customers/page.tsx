"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";

type Customer = {
  id: string;
  name: string;
  contact: string | null;
  favorite: string | null;
  customer_tags: {
    interest_tags: {
      name: string;
    };
  }[];
};

const CustomerPage = () => {
  const [customers, setCustomers] = useState<Customer[]>();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [favorite, setFavorite] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  const fetchCustomers = async () => {
    const { data } = await supabase
      .from("customers")
      .select(
        `
        id,
        name,
        contact,
        favorite,
        customer_tags(
          interest_tags(name)
        )
      `,
      )
      .order("created_at", { ascending: false });

    if (data) setCustomers(data as unknown as Customer[]);
  };

  const addCustomer = async () => {
    if (!name) return;

    const { data: customer } = await supabase
      .from("customers")
      .insert({ name, contact, favorite })
      .select()
      .single();

    if (!customer) return;

    const tagList = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    for (const tagName of tagList) {
      let { data: tag } = await supabase
        .from("interest_tags")
        .select("*")
        .eq("name", tagName)
        .single();

      if (!tag) {
        const { data: newTag } = await supabase
          .from("interest_tags")
          .insert({ name: tagName })
          .select()
          .single();

        tag = newTag;
      }

      await supabase.from("customer_tags").insert({
        customer_id: customer.id,
        tag_id: tag.id,
      });
    }

    setName("");
    setContact("");
    setFavorite("");
    setTagsInput("");
    fetchCustomers();
  };

  const deleteCustomer = async (id: string) => {
    await supabase.from("customers").delete().eq("id", id);
    fetchCustomers();
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Customers</h1>

      <div className="space-y-2 max-w-md">
        <input
          className="border p-2 w-full"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="border p-2 w-full"
          placeholder="Contact (optional)"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
        />
        <input
          className="border p-2 w-full"
          placeholder="Favorite drink/product"
          value={favorite}
          onChange={(e) => setFavorite(e.target.value)}
        />
        <input
          className="border p-2 w-full"
          placeholder="Tags (comma separated)"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
        />
        <button onClick={addCustomer} className="bg-black text-white px-4 py-2">
          Add Customer
        </button>
      </div>

      <div className="space-y-4">
        {customers?.map((c) => (
          <div key={c.id} className="border p-4 rounded">
            <div className="font-semibold">{c.name}</div>
            {c.contact && (
              <div className="text-sm text-gray-600">{c.contact}</div>
            )}
            {c.favorite && (
              <div className="text-sm">Favorite: {c.favorite}</div>
            )}

            <div className="flex gap-2 mt-2 flex-wrap">
              {c.customer_tags?.map((t, i) => (
                <span key={i} className="text-xs bg-gray-200 px-2 py-1 rounded">
                  {t.interest_tags.name}
                </span>
              ))}
            </div>

            <button
              onClick={() => deleteCustomer(c.id)}
              className="text-red-500 text-sm mt-2"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerPage;
