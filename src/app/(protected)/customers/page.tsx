"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";
import { LoadingOverlay } from "@/src/components/loadingoverlay";
import { CustomerSearchFilters } from "@/src/components/customersearchfilter";
import { CustomerList } from "@/src/components/customerlist";
import { CustomerForm } from "@/src/components/customerform";

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
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

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

      // Client-side filter by interests
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
    setFormData({
      name: "",
      contact: "",
      favorite: "",
      tagsInput: "",
    });
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
    setFormData({
      name: "",
      contact: "",
      favorite: "",
      tagsInput: "",
    });
    fetchCustomers();
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

  useEffect(() => {
    const loadData = async () => {
      if (!loading) {
        setIsFetching(true);
      }

      try {
        await fetchCustomers();
      } finally {
        setLoading(false);
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

        {/* LIST SECTION */}
        <div className="lg:col-span-2 space-y-4">
          <CustomerList
            customers={customers}
            isFetching={isFetching}
            onClickEditButton={onClickEditButton}
            deleteCustomer={deleteCustomer}
          />
        </div>
      </div>
      <LoadingOverlay show={loading} />
    </div>
  );
};

export default CustomerPage;
