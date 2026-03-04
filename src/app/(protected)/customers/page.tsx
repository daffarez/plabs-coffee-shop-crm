"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";
import { CustomerSearchFilters } from "@/src/components/customersearchfilter";
import { CustomerList } from "@/src/components/customerlist";
import { CustomerForm } from "@/src/components/customerform";
import { useLoadingStore } from "@/src/store/useloadingstore";

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

type FormErrors = {
  name?: string;
  favorite?: string;
  tags?: string;
};

const CustomerPage = () => {
  const [customers, setCustomers] = useState<Customer[]>();
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    favorite: "",
    tagsInput: "",
  });
  const [filterTag, setFilterTag] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const { startLoading, stopLoading } = useLoadingStore();

  const { name, contact, favorite, tagsInput } = formData;

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

  const parseTags = (input: string): string[] => {
    return input
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  };

  const ensureTagsExist = async (tagNames: string[]): Promise<string[]> => {
    if (tagNames.length === 0) return [];

    const { data: existing, error: fetchError } = await supabase
      .from("interest_tags")
      .select("id, name")
      .in("name", tagNames);

    if (fetchError) throw fetchError;

    const existingMap = new Map<string, string>(
      existing?.map((tag) => [tag.name, tag.id]) || [],
    );

    const newTags = tagNames.filter((name) => !existingMap.has(name));

    if (newTags.length > 0) {
      const { data: inserted, error: insertError } = await supabase
        .from("interest_tags")
        .insert(newTags.map((name) => ({ name })))
        .select("id, name");

      if (insertError) throw insertError;

      inserted?.forEach((tag) => {
        existingMap.set(tag.name, tag.id);
      });
    }

    return tagNames.map((name) => existingMap.get(name)!);
  };

  const syncCustomerTags = async (customerId: string, tagIds: string[]) => {
    await supabase.from("customer_tags").delete().eq("customer_id", customerId);

    if (tagIds.length === 0) return;

    await supabase.from("customer_tags").insert(
      tagIds.map((tagId) => ({
        customer_id: customerId,
        tag_id: tagId,
      })),
    );
  };

  const saveCustomer = async () => {
    if (!name) return;

    try {
      startLoading();

      const tagNames = parseTags(tagsInput);
      let customerId = editingId;

      if (!editingId) {
        const { data: customer, error } = await supabase
          .from("customers")
          .insert({ name, contact, favorite })
          .select("id")
          .single();

        if (error || !customer) throw error;

        customerId = customer.id;
      } else {
        const { error } = await supabase
          .from("customers")
          .update({ name, contact, favorite })
          .eq("id", editingId);

        if (error) throw error;
      }

      const tagIds = await ensureTagsExist(tagNames);

      await syncCustomerTags(customerId!, tagIds);

      setEditingId(null);
      setFormData({
        name: "",
        contact: "",
        favorite: "",
        tagsInput: "",
      });

      await fetchCustomers();
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      stopLoading();
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      startLoading();
      await supabase.from("customers").delete().eq("id", id);
      await fetchCustomers();
    } finally {
      stopLoading();
    }
  };

  const onClickEditButton = (data: Customer) => {
    setEditingId(data.id);
    setFormData({
      name: data.name,
      contact: data.contact || "",
      favorite: data.favorite || "",
      tagsInput: data.customer_tags
        ?.map((tags) => tags.interest_tags.name)
        .join(", "),
    });
  };

  const onClickCancelEditButton = () => {
    setEditingId(null);
    setFormData({
      name: "",
      contact: "",
      favorite: "",
      tagsInput: "",
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors: {
      name?: string;
      favorite?: string;
      tags?: string;
    } = {};

    if (!name.trim()) {
      newErrors.name = "Name is required.";
    }

    if (!favorite.trim()) {
      newErrors.favorite = "Favorite item is required.";
    }

    if (!tagsInput.trim()) {
      newErrors.tags = "At least one interest tag is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    const isValid = validateForm();

    if (!isValid) return;

    startLoading();

    try {
      saveCustomer();
    } finally {
      stopLoading();
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const isFirstLoad = !customers || customers.length === 0;

      if (isFirstLoad) {
        startLoading("Fetching your coffee crew...");
      } else {
        setIsFetching(true);
      }

      try {
        await fetchCustomers();
      } finally {
        stopLoading();
        setIsFetching(false);
      }
    };

    loadData();
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

  useEffect(() => {
    setErrors((prev) => ({
      ...prev,
      name: name ? undefined : prev.name,
      favorite: favorite ? undefined : prev.favorite,
      tags: tagsInput ? undefined : prev.tags,
    }));
  }, [name, favorite, tagsInput]);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#2D2424] tracking-tight">
            Customers
          </h1>
        </div>
      </div>

      <CustomerSearchFilters
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        filterTag={filterTag}
        setFilterTag={setFilterTag}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <CustomerForm
          editingId={editingId}
          formData={formData}
          errors={errors}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          onClickCancelEditButton={onClickCancelEditButton}
        />

        <div className="lg:col-span-2 space-y-4">
          <CustomerList
            customers={customers}
            isFetching={isFetching}
            onClickEditButton={onClickEditButton}
            deleteCustomer={deleteCustomer}
          />
        </div>
      </div>
    </div>
  );
};

export default CustomerPage;
