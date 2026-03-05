"use client";

import { SetStateAction, useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";
import { CustomerSearchFilters } from "@/src/components/customersearchfilter";
import { CustomerList } from "@/src/components/customerlist";
import { CustomerForm } from "@/src/components/customerform";
import { useLoadingStore } from "@/src/store/useloadingstore";
import { useToastStore } from "@/src/store/usetoaststore";
import { ConfirmModal } from "@/src/components/confirmmodal";
import { saveCustomer, deleteCustomer } from "@/src/services/customer.service";

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
  const [debouncedTag, setDebouncedTag] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [isFilter, setIsFilter] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(
    null,
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const pageSize = 10;

  const { startLoading, stopLoading } = useLoadingStore();
  const { showToast } = useToastStore();

  const { name, contact, favorite, tagsInput } = formData;

  const fetchCustomers = async () => {
    try {
      setIsFetching(true);

      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from("customers")
        .select(
          `id, name, contact, favorite, customer_tags(interest_tags(name))`,
          { count: "exact" },
        )
        .order("created_at", { ascending: false })
        .range(from, to);

      if (debouncedSearch) {
        query = query.ilike("name", `%${debouncedSearch}%`);
      }

      const { data, count, error } = await query;
      if (error) throw error;

      let filtered = data as unknown as Customer[];
      if (debouncedTag) {
        filtered = filtered.filter((customer) =>
          customer.customer_tags?.some((ct) =>
            ct.interest_tags?.name
              .toLowerCase()
              .includes(debouncedTag.toLowerCase()),
          ),
        );
      }

      setCustomers(filtered);
      setTotalCount(count || 0);
    } catch (err) {
      showToast("Gagal memuat data.", "error");
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

  const handleConfirmDelete = async () => {
    if (!customerToDelete) return;

    setIsDeleteModalOpen(false);
    startLoading(`Deleting ${customerToDelete.name}...`);

    try {
      await deleteCustomer(customerToDelete.id);
      showToast("Customer data has been successfully deleted.", "success");
      await fetchCustomers();
    } catch {
      showToast("Failed to delete data.", "error");
    } finally {
      stopLoading();
      setCustomerToDelete(null);
    }
  };

  const onClickDeleteButton = (customer: Customer) => {
    setCustomerToDelete(customer);
    setIsDeleteModalOpen(true);
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

    startLoading(editingId ? "Saving changes..." : "Adding new customer...");

    try {
      await saveCustomer({
        id: editingId,
        name,
        contact,
        favorite,
        tagsInput,
      });

      setEditingId(null);
      setFormData({ name: "", contact: "", favorite: "", tagsInput: "" });

      showToast("Data saved successfully.", "success");
      await fetchCustomers();
    } catch {
      showToast("Failed to save data.", "error");
    } finally {
      stopLoading();
    }
  };

  const handleDebounce = (
    input: string,
    debounceFunction: (value: SetStateAction<string>) => void,
  ) => {
    if (input.length >= 3) {
      debounceFunction(input);
    } else {
      debounceFunction("");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (!isFilter) {
        startLoading("Fetching your coffee crew...");
      }

      try {
        await fetchCustomers();
      } finally {
        stopLoading();
        setIsFilter(false);
      }
    };

    loadData();
  }, [debouncedSearch, debouncedTag, currentPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFilter(true);
      setCurrentPage(1);
      handleDebounce(searchInput, setDebouncedSearch);
      handleDebounce(filterTag, setDebouncedTag);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, filterTag]);

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
            onClickDeleteButton={onClickDeleteButton}
            totalCount={totalCount}
            pageSize={pageSize}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setCustomerToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Remove Customer?"
        description={`Are you sure you want to delete "${customerToDelete?.name}"? This action cannot be undone. All data associated with this customer will be lost.`}
        confirmText="Delete Now"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default CustomerPage;
