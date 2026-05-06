"use server";

import { revalidatePath } from "next/cache";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export type CheckoutLine = { productId: string; variantId?: string | null; qty: number };

/**
 * Best-effort stock deduction when the customer taps "Open WhatsApp".
 * WhatsApp itself is not tracked — if they abandon chat, stock may need a manual fix in Admin.
 * Products with stock_quantity = NULL are not decremented (unlimited).
 */
export async function applyCheckoutStockDecrement(
  items: CheckoutLine[],
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!items.length) return { ok: false, error: "No items in order." };

  const qtyByProduct = new Map<string, number>();
  const qtyByVariant = new Map<string, number>();
  for (const { productId, variantId, qty } of items) {
    if (!productId || qty < 1) return { ok: false, error: "Invalid cart line." };
    if (variantId) continue;
    qtyByProduct.set(productId, (qtyByProduct.get(productId) ?? 0) + qty);
  }
  for (const { variantId, qty } of items) {
    if (!variantId) continue;
    qtyByVariant.set(variantId, (qtyByVariant.get(variantId) ?? 0) + qty);
  }

  const supabase = createAdminSupabaseClient();
  const ids = [...qtyByProduct.keys()];
  let rows: {
    id: string;
    stock_quantity: number | null;
    sold_out: boolean;
    name: string;
  }[] = [];
  if (ids.length > 0) {
    const { data, error: fetchError } = await supabase
      .from("products")
      .select("id, stock_quantity, sold_out, name")
      .in("id", ids);
    if (fetchError) return { ok: false, error: fetchError.message };
    rows = data;
    if (!rows?.length || rows.length !== ids.length) {
      return { ok: false, error: "A product in your cart is no longer available." };
    }
  }

  if (qtyByVariant.size > 0) {
    const variantIds = [...qtyByVariant.keys()];
    const { data: variants, error: varErr } = await supabase
      .from("product_variants")
      .select("id, product_id, stock_quantity, sold_out, size, color")
      .in("id", variantIds);

    if (varErr) return { ok: false, error: varErr.message };
    if (!variants?.length || variants.length !== variantIds.length) {
      return { ok: false, error: "A selected variant is no longer available." };
    }

    for (const v of variants) {
      const need = qtyByVariant.get(v.id) ?? 0;
      if (v.sold_out) {
        const label = [v.size, v.color].filter(Boolean).join(" / ") || "selected variant";
        return { ok: false, error: `Variant "${label}" is sold out.` };
      }
      if (v.stock_quantity != null && v.stock_quantity < need) {
        const label = [v.size, v.color].filter(Boolean).join(" / ") || "selected variant";
        return {
          ok: false,
          error: `Not enough stock for variant "${label}" (only ${v.stock_quantity} left).`,
        };
      }
    }

    for (const v of variants) {
      if (v.stock_quantity == null) continue;
      const need = qtyByVariant.get(v.id) ?? 0;
      const current = v.stock_quantity;
      const next = current - need;
      if (next < 0) {
        return { ok: false, error: "Variant stock changed — refresh and try again." };
      }
      const { data: updated, error: upErr } = await supabase
        .from("product_variants")
        .update({
          stock_quantity: next,
          sold_out: next <= 0,
          updated_at: new Date().toISOString(),
        })
        .eq("id", v.id)
        .eq("stock_quantity", current)
        .select("id");
      if (upErr) return { ok: false, error: upErr.message };
      if (!updated?.length) {
        return { ok: false, error: "Variant stock changed — refresh and try again." };
      }
    }
  }

  for (const row of rows) {
    if (row.sold_out) {
      return { ok: false, error: `"${row.name}" is sold out. Remove it and try again.` };
    }
    const need = qtyByProduct.get(row.id) ?? 0;
    if (row.stock_quantity != null && row.stock_quantity < need) {
      return {
        ok: false,
        error: `Not enough stock for "${row.name}" (only ${row.stock_quantity} left).`,
      };
    }
  }

  for (const row of rows) {
    if (row.stock_quantity == null) continue;
    const need = qtyByProduct.get(row.id) ?? 0;
    const current = row.stock_quantity;
    const next = current - need;
    if (next < 0) {
      return { ok: false, error: `Stock changed for "${row.name}" — refresh and try again.` };
    }

    const { data: updated, error: upErr } = await supabase
      .from("products")
      .update({
        stock_quantity: next,
        sold_out: next <= 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id)
      .eq("stock_quantity", current)
      .select("id");

    if (upErr) return { ok: false, error: upErr.message };
    if (!updated?.length) {
      return {
        ok: false,
        error: `Stock changed for "${row.name}" — refresh your cart and try again.`,
      };
    }
  }

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/cart");
  revalidatePath("/checkout");
  revalidatePath("/admin/products");
  revalidatePath("/admin/analytics");
  for (const id of ids) revalidatePath(`/product/${id}`);

  return { ok: true };
}
