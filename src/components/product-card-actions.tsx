"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart } from "@/components/cart/cart-context";
import type { ProductVariantRow } from "@/lib/catalog";

export function ProductCardActions({
  product,
  variants = [],
}: {
  product: {
    id: string;
    name: string;
    image_url: string | null;
    price_hint: string | null;
    sold_out: boolean;
    stock_quantity: number | null;
  };
  variants?: ProductVariantRow[];
}) {
  const { addLine, lines } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    variants[0]?.id ?? "",
  );
  const selectedVariant =
    variants.find((v) => v.id === selectedVariantId) ?? variants[0] ?? null;
  const selectedKey = selectedVariant?.id ?? "";
  const inCart = lines
    .filter(
      (l) =>
        l.productId === product.id &&
        (selectedKey ? l.variantId === selectedKey : l.variantId == null),
    )
    .reduce((sum, l) => sum + l.qty, 0);
  const cap =
    selectedVariant?.stock_quantity != null
      ? selectedVariant.stock_quantity
      : product.stock_quantity != null && product.stock_quantity >= 0
        ? product.stock_quantity
        : null;
  const atCap = cap !== null && inCart >= cap;
  const variantSoldOut = selectedVariant?.sold_out ?? false;
  const canPurchase = !product.sold_out && !variantSoldOut && !atCap;
  const hasVariants = variants.length > 0;

  const checkoutHref = useMemo(() => {
    const q = new URLSearchParams({ product: product.id });
    if (selectedVariant?.id) q.set("variant", selectedVariant.id);
    return `/checkout?${q.toString()}`;
  }, [product.id, selectedVariant?.id]);

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!canPurchase) return;
    addLine({
      productId: product.id,
      name: product.name,
      image_url: product.image_url,
      price_hint: product.price_hint,
      variantId: selectedVariant?.id ?? null,
      size: selectedVariant?.size ?? null,
      color: selectedVariant?.color ?? null,
      qty: 1,
    });
  }

  return (
    <div
      className="space-y-2 border-t border-[var(--border)] p-3 sm:p-4"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      role="presentation"
    >
      {hasVariants ? (
        <label className="block text-xs">
          <span className="sr-only">Variant</span>
          <select
            className="ui-select py-2 text-xs"
            value={selectedVariantId}
            onChange={(e) => setSelectedVariantId(e.target.value)}
          >
            {variants.map((v) => (
              <option key={v.id} value={v.id}>
                {[v.size, v.color].filter(Boolean).join(" / ") || "Option"}
                {v.sold_out ? " (sold out)" : ""}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          disabled={!canPurchase}
          onClick={handleAdd}
          className="min-h-10 flex-1 rounded-lg bg-[var(--gold)] px-3 py-2 text-center text-xs font-semibold text-[var(--on-gold)] transition hover:bg-[var(--gold-hover)] disabled:cursor-not-allowed disabled:opacity-45"
        >
          {product.sold_out || variantSoldOut
            ? "Sold out"
            : atCap
              ? "Max in cart"
              : "Add to cart"}
        </button>
        {!canPurchase ? (
          <span className="min-h-10 flex flex-1 cursor-not-allowed items-center justify-center rounded-lg border border-[var(--border)] px-3 py-2 text-center text-xs font-semibold opacity-45">
            Buy now
          </span>
        ) : (
          <Link
            href={checkoutHref}
            className="min-h-10 flex flex-1 items-center justify-center rounded-lg border border-[var(--border)] px-3 py-2 text-center text-xs font-semibold transition hover:border-[var(--gold)]/40 hover:bg-[var(--nav-hover)]"
          >
            Buy now
          </Link>
        )}
      </div>
    </div>
  );
}
