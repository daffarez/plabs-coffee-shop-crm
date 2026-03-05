import { supabase } from "@/src/lib/supabase";

export const parseTags = (input: string): string[] => {
  return input
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
};

export const ensureTagsExist = async (
  tagNames: string[],
): Promise<string[]> => {
  if (tagNames.length === 0) return [];

  const { data: existing, error } = await supabase
    .from("interest_tags")
    .select("id, name")
    .in("name", tagNames);

  if (error) throw error;

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

export const syncCustomerTags = async (
  customerId: string,
  tagIds: string[],
) => {
  await supabase.from("customer_tags").delete().eq("customer_id", customerId);

  if (tagIds.length === 0) return;

  await supabase.from("customer_tags").insert(
    tagIds.map((tagId) => ({
      customer_id: customerId,
      tag_id: tagId,
    })),
  );
};

export const saveCustomer = async ({
  id,
  name,
  contact,
  favorite,
  tagsInput,
}: {
  id?: string | null;
  name: string;
  contact?: string;
  favorite?: string;
  tagsInput: string;
}) => {
  const tagNames = parseTags(tagsInput);
  let customerId = id;

  if (!id) {
    const { data, error } = await supabase
      .from("customers")
      .insert({ name, contact, favorite })
      .select("id")
      .single();

    if (error || !data) throw error;
    customerId = data.id;
  } else {
    const { error } = await supabase
      .from("customers")
      .update({ name, contact, favorite })
      .eq("id", id);

    if (error) throw error;
  }

  const tagIds = await ensureTagsExist(tagNames);
  await syncCustomerTags(customerId!, tagIds);

  return customerId;
};

export const deleteCustomer = async (id: string) => {
  const { error } = await supabase.from("customers").delete().eq("id", id);

  if (error) throw error;
};
