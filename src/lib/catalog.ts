import { createPublicSupabaseClient } from "@/lib/supabase/public";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

export type ProductRow = {
  id: string;
  category_id: string | null;
  name: string;
  description: string;
  image_url: string | null;
  price_hint: string | null;
  stock_quantity: number | null;
  sold_out: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductVariantRow = {
  id: string;
  product_id: string;
  size: string | null;
  color: string | null;
  stock_quantity: number | null;
  sold_out: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type FeaturedProduct = ProductRow & {
  categoryName: string | null;
};

export async function getCategories(): Promise<CategoryRow[]> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as CategoryRow[];
}

export async function getCategoryBySlug(slug: string): Promise<CategoryRow | null> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return (data as CategoryRow) ?? null;
}

export async function getProductsByCategory(categoryId: string): Promise<ProductRow[]> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category_id", categoryId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return normalizeProductRows(data);
}

export async function getAllProducts(): Promise<ProductRow[]> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return normalizeProductRows(data);
}

export async function getProductById(id: string): Promise<ProductRow | null> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? normalizeProductRow(data as ProductRow) : null;
}

function isMissingTableError(error: unknown): boolean {
  const code = (error as { code?: string } | null)?.code;
  return code === "42P01";
}

function normalizeVariantRow(row: ProductVariantRow): ProductVariantRow {
  return {
    ...row,
    stock_quantity:
      row.stock_quantity === undefined || row.stock_quantity === null
        ? null
        : Number(row.stock_quantity),
  };
}

function normalizeVariantRows(data: unknown): ProductVariantRow[] {
  return (data as ProductVariantRow[] | null)?.map(normalizeVariantRow) ?? [];
}

export async function getVariantsForProduct(productId: string): Promise<ProductVariantRow[]> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    if (isMissingTableError(error)) return [];
    throw error;
  }
  return normalizeVariantRows(data);
}

export async function getVariantsByProductIds(
  productIds: string[],
): Promise<Record<string, ProductVariantRow[]>> {
  if (!productIds.length) return {};
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("product_variants")
    .select("*")
    .in("product_id", productIds)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    if (isMissingTableError(error)) return {};
    throw error;
  }

  const rows = normalizeVariantRows(data);
  const map: Record<string, ProductVariantRow[]> = {};
  for (const row of rows) {
    map[row.product_id] ||= [];
    map[row.product_id].push(row);
  }
  return map;
}

export async function getAllVariants(): Promise<ProductVariantRow[]> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("product_variants")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    if (isMissingTableError(error)) return [];
    throw error;
  }
  return normalizeVariantRows(data);
}

/** Featured products for the home page (newest first). Sold-out items stay listed with a ribbon in the UI. */
export async function getFeaturedProducts(limit = 8): Promise<FeaturedProduct[]> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  const products = normalizeProductRows(data);
  const categories = await getCategories();
  const nameById = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  return products.map((p) => ({
    ...p,
    categoryName: p.category_id ? nameById[p.category_id] ?? null : null,
  }));
}

export async function getWhatsAppNumberPublic(): Promise<string> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "whatsapp_number")
    .maybeSingle();
  if (error) throw error;
  return (data?.value as string) ?? "";
}

/** Admin: read settings with service role (same as public for this key). */
export async function getWhatsAppNumberAdmin(): Promise<string> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "whatsapp_number")
    .maybeSingle();
  if (error) throw error;
  return (data?.value as string) ?? "";
}

function normalizeProductRows(data: unknown): ProductRow[] {
  return (data as ProductRow[] | null)?.map(normalizeProductRow) ?? [];
}

/** Older DBs may not have stock_quantity until migration is applied. */
function normalizeProductRow(row: ProductRow): ProductRow {
  return {
    ...row,
    stock_quantity:
      row.stock_quantity === undefined || row.stock_quantity === null
        ? null
        : Number(row.stock_quantity),
  };
}
