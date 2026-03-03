"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";
import LoadingOverlay from "@/src/components/loadingoverlay";

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
  const [filterTag, setFilterTag] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isFetching, setIsFetching] = useState(false);

  const fetchCustomers = async () => {
    try {
      setIsFetching(true);
      let query = supabase
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

      if (debouncedSearch) {
        query = query.ilike("name", `%${debouncedSearch}%`);
      }

      const { data } = await query;

      if (!data) return;

      let filtered = data as unknown as Customer[];

      // Client-side filter by tag
      if (filterTag) {
        filtered = filtered.filter((customer) =>
          customer.customer_tags?.some((ct) =>
            ct.interest_tags?.name
              ?.toLowerCase()
              .includes(filterTag.toLowerCase()),
          ),
        );
      }

      setCustomers(filtered);
    } catch (err) {
      console.log(`error fetching data:: ${err}`);
    } finally {
      setIsFetching(false);
    }
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
    setLoading(true);
    await supabase.from("customers").delete().eq("id", id);
    fetchCustomers();
  };

  const updateCustomer = async () => {
    if (!editingId) return;

    // Update basic fields
    await supabase
      .from("customers")
      .update({
        name,
        contact,
        favorite,
      })
      .eq("id", editingId);

    // Prepare new tag list
    const tagList = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    // Ensure all tags exist
    const tagIds: string[] = [];

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

      tagIds.push(tag.id);
    }

    // Remove old relations
    await supabase.from("customer_tags").delete().eq("customer_id", editingId);

    // Insert new relations
    for (const tagId of tagIds) {
      await supabase.from("customer_tags").insert({
        customer_id: editingId,
        tag_id: tagId,
      });
    }

    setEditingId(null);
    setName("");
    setContact("");
    setFavorite("");
    setTagsInput("");
    fetchCustomers();
  };

  useEffect(() => {
    fetchCustomers();
  }, [debouncedSearch, filterTag]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput.length >= 3) {
        setDebouncedSearch(searchInput);
      } else {
        setDebouncedSearch("");
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const onClickEditButton = (data: Customer) => {
    setEditingId(data.id);
    setName(data.name);
    setContact(data.contact || "");
    setFavorite(data.favorite || "");
    setTagsInput(
      data.customer_tags?.map((tags) => tags.interest_tags.name).join(", "),
    );
  };

  const onClickCancelEditButton = () => {
    setEditingId(null);
    setName("");
    setContact("");
    setFavorite("");
    setTagsInput("");
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      if (editingId) {
        await updateCustomer();
      } else {
        await addCustomer();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Customers</h1>

      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            className="border p-2 w-full md:max-w-sm rounded"
            placeholder="Search by name (min 3 chars)..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />

          <input
            className="border p-2 w-full md:max-w-sm rounded"
            placeholder="Filter by tag..."
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
          />
        </div>
      </div>

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
        <button
          onClick={handleSubmit}
          className="bg-black text-white px-4 py-2"
        >
          {editingId ? "Update Customer" : "Add Customer"}
        </button>
        {editingId && (
          <button
            onClick={onClickCancelEditButton}
            className="text-sm text-gray-500 ml-3"
          >
            Cancel
          </button>
        )}
      </div>

      <div className="space-y-4">
        {isFetching && (
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-black" />
            Fetching data...
          </div>
        )}
        {!loading && customers?.length === 0 ? (
          <p className="text-gray-500">No customers found.</p>
        ) : (
          customers?.map((data) => (
            <div key={data.id} className="border p-4 rounded">
              <div className="font-semibold">{data.name}</div>
              {data.contact && (
                <div className="text-sm text-gray-600">{data.contact}</div>
              )}
              {data.favorite && (
                <div className="text-sm">Favorite: {data.favorite}</div>
              )}

              <div className="flex gap-2 mt-2 flex-wrap">
                {data.customer_tags?.map((tags, i) => (
                  <span
                    key={i}
                    className="text-xs bg-gray-200 px-2 py-1 rounded"
                  >
                    {tags.interest_tags.name}
                  </span>
                ))}
              </div>

              <button
                onClick={() => onClickEditButton(data)}
                className="text-blue-500 text-sm mr-3"
              >
                Edit
              </button>

              <button
                onClick={() => deleteCustomer(data.id)}
                className="text-red-500 text-sm mt-2"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
      <LoadingOverlay show={loading} />
    </div>
  );
};

export default CustomerPage;
