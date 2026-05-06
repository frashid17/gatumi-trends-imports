"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { isAdminUser } from "@/lib/admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/slug";

async function requireAdmin() {
  const user = await currentUser();
  if (!isAdminUser(user)) {
    throw new Error("Unauthorized");
  }
  await auth();
}

function parseStockQuantity(formData: FormData): number | null {
  const raw = String(formData.get("stock_quantity") ?? "").trim();
  if (raw === "") return null;
  const n = parseInt(raw, 10);
  if (Number.isNaN(n) || n < 0) throw new Error("Stock quantity must be a whole number ≥ 0, or leave blank for unlimited.");
  return n;
}

type ParsedVariant = {
  size: string | null;
  color: string | null;
  stock_quantity: number | null;
  sold_out: boolean;
  sort_order: number;
};

function parseVariantsInput(formData: FormData): ParsedVariant[] {
  const raw = String(formData.get("variants_input") ?? "");
  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const out: ParsedVariant[] = [];
  lines.forEach((line, i) => {
    const [sizeRaw = "", colorRaw = "", stockRaw = "", soldRaw = ""] = line
      .split("|")
      .map((p) => p.trim());
    const size = sizeRaw || null;
    const color = colorRaw || null;
    if (!size && !color) {
      throw new Error(`Variant line ${i + 1}: add at least size or color.`);
    }
    let stock_quantity: number | null = null;
    if (stockRaw !== "") {
      const n = parseInt(stockRaw, 10);
      if (Number.isNaN(n) || n < 0) {
        throw new Error(`Variant line ${i + 1}: stock must be blank or a whole number >= 0.`);
      }
      stock_quantity = n;
    }
    const soldFlag = soldRaw.toLowerCase();
    const sold_out = soldFlag === "1" || soldFlag === "true" || soldFlag === "yes" || soldFlag === "sold";
    out.push({
      size,
      color,
      stock_quantity,
      sold_out: sold_out || stock_quantity === 0,
      sort_order: i,
    });
  });
  return out;
}

async function syncProductVariants(productId: string, variants: ParsedVariant[]) {
  const supabase = createAdminSupabaseClient();
  const { error: delErr } = await supabase.from("product_variants").delete().eq("product_id", productId);
  if (delErr) throw delErr;
  if (!variants.length) return;
  const { error: insErr } = await supabase.from("product_variants").insert(
    variants.map((v) => ({
      product_id: productId,
      size: v.size,
      color: v.color,
      stock_quantity: v.stock_quantity,
      sold_out: v.sold_out,
      sort_order: v.sort_order,
    })),
  );
  if (insErr) throw insErr;
}

export async function updateWhatsAppNumber(formData: FormData) {
  await requireAdmin();
  const value = String(formData.get("whatsapp_number") ?? "").trim();
  if (!value) throw new Error("WhatsApp number required");
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from("site_settings").upsert(
    { key: "whatsapp_number", value, updated_at: new Date().toISOString() },
    { onConflict: "key" },
  );
  if (error) throw error;
  revalidatePath("/admin/settings");
  revalidatePath("/cart");
}

export async function createCategory(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Name required");
  const rawSlug = String(formData.get("slug") ?? "").trim();
  const slug = slugify(rawSlug || name);
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from("categories").insert({ name, slug });
  if (error) throw error;
  revalidatePath("/admin/categories");
  revalidatePath("/");
  revalidatePath("/shop");
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/categories");
  revalidatePath("/");
  revalidatePath("/shop");
}

export async function createProduct(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const category_id = String(formData.get("category_id") ?? "") || null;
  const description = String(formData.get("description") ?? "");
  const image_url = String(formData.get("image_url") ?? "").trim() || null;
  const price_hint = String(formData.get("price_hint") ?? "").trim() || null;
  const stock_quantity = parseStockQuantity(formData);
  const variants = parseVariantsInput(formData);
  let sold_out = formData.get("sold_out") === "on";
  if (stock_quantity === 0) sold_out = true;
  if (!name) throw new Error("Name required");
  const supabase = createAdminSupabaseClient();
  const { data: inserted, error } = await supabase
    .from("products")
    .insert({
    name,
    category_id,
    description,
    image_url,
    price_hint,
    stock_quantity,
    sold_out,
    })
    .select("id")
    .single();
  if (error) throw error;
  if (inserted?.id) {
    await syncProductVariants(inserted.id, variants);
  }
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
}

export async function updateProduct(id: string, formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const category_id = String(formData.get("category_id") ?? "") || null;
  const description = String(formData.get("description") ?? "");
  const image_url = String(formData.get("image_url") ?? "").trim() || null;
  const price_hint = String(formData.get("price_hint") ?? "").trim() || null;
  const stock_quantity = parseStockQuantity(formData);
  const variants = parseVariantsInput(formData);
  let sold_out = formData.get("sold_out") === "on";
  if (stock_quantity === 0) sold_out = true;
  if (!name) throw new Error("Name required");
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase
    .from("products")
    .update({
      name,
      category_id,
      description,
      image_url,
      price_hint,
      stock_quantity,
      sold_out,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw error;
  await syncProductVariants(id, variants);
  revalidatePath("/admin/products");
  revalidatePath(`/product/${id}`);
  revalidatePath("/shop");
  revalidatePath("/");
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
}

export async function toggleProductSoldOut(id: string, sold_out: boolean) {
  await requireAdmin();
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase
    .from("products")
    .update({ sold_out, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/products");
  revalidatePath(`/product/${id}`);
  revalidatePath("/shop");
  revalidatePath("/");
}
