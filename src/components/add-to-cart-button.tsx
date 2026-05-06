"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart } from "@/components/cart/cart-context";
import type { ProductVariantRow } from "@/lib/catalog";

export function AddToCartButton({
  product,
  disabled,
  className = "",
  stockQuantity,
  variants = [],
  showBuyNow = false,
}: {
  product: {
    productId: string;
    name: string;
    image_url: string | null;
    price_hint: string | null;
  };
  disabled?: boolean;
  className?: string;
  /** When set, caps how many can be in cart for this product (tracked stock). */
  stockQuantity?: number | null;
  variants?: ProductVariantRow[];
  /** Link to /checkout with current variant (same stock rules as add to cart). */
  showBuyNow?: boolean;
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
        l.productId === product.productId &&
        (selectedKey ? l.variantId === selectedKey : l.variantId == null),
    )
    .reduce((sum, l) => sum + l.qty, 0);
  const cap =
    selectedVariant?.stock_quantity != null
      ? selectedVariant.stock_quantity
      : stockQuantity != null && stockQuantity >= 0
        ? stockQuantity
        : null;
  const atCap = cap !== null && inCart >= cap;
  const variantSoldOut = selectedVariant?.sold_out ?? false;
  const isDisabled = disabled || variantSoldOut || atCap;
  const hasVariants = variants.length > 0;
  const sizeOptions = useMemo(
    () =>
      [...new Set(variants.map((v) => v.size).filter((x): x is string => Boolean(x)))],
    [variants],
  );
  const colorOptions = useMemo(
    () =>
      [...new Set(variants.map((v) => v.color).filter((x): x is string => Boolean(x)))],
    [variants],
  );
  const variantLabel = [selectedVariant?.size, selectedVariant?.color]
    .filter(Boolean)
    .join(" / ");

  const checkoutHref = useMemo(() => {
    const q = new URLSearchParams({ product: product.productId });
    if (selectedVariant?.id) q.set("variant", selectedVariant.id);
    return `/checkout?${q.toString()}`;
  }, [product.productId, selectedVariant?.id]);

  return (
    <div className="w-full sm:w-auto">
      {hasVariants ? (
        <label className="mb-2 block text-sm">
          <span className="text-[var(--foreground-muted)]">Variant</span>
          <select
            className="ui-select mt-1"
            value={selectedVariantId}
            onChange={(e) => setSelectedVariantId(e.target.value)}
          >
            {variants.map((v) => (
              <option key={v.id} value={v.id}>
                {`${v.size ?? "One size"}${v.color ? ` / ${v.color}` : ""}${
                  v.sold_out ? " (sold out)" : ""
                }`}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {hasVariants && (sizeOptions.length || colorOptions.length) ? (
        <p className="mb-2 text-xs text-[var(--foreground-muted)]">
          {sizeOptions.length ? `Sizes: ${sizeOptions.join(", ")}` : ""}
          {sizeOptions.length && colorOptions.length ? " • " : ""}
          {colorOptions.length ? `Colors: ${colorOptions.join(", ")}` : ""}
        </p>
      ) : null}
      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-stretch">
        <button
          type="button"
          disabled={isDisabled}
          onClick={() =>
            addLine({
              ...product,
              variantId: selectedVariant?.id ?? null,
              size: selectedVariant?.size ?? null,
              color: selectedVariant?.color ?? null,
              qty: 1,
            })
          }
          className={`min-h-12 w-full rounded-xl bg-[var(--gold)] px-6 py-3.5 text-sm font-semibold text-[var(--on-gold)] shadow-lg shadow-[var(--gold)]/15 transition hover:bg-[var(--gold-hover)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto sm:min-h-0 ${className}`}
        >
          {disabled || variantSoldOut
            ? "Sold out"
            : atCap
              ? "Max in cart for this item"
              : hasVariants
                ? "Add selected variant"
                : "Add to cart"}
        </button>
        {showBuyNow ? (
          isDisabled ? (
            <span className="flex min-h-12 w-full cursor-not-allowed items-center justify-center rounded-xl border border-[var(--border)] px-6 py-3.5 text-sm font-semibold opacity-45 sm:w-auto sm:min-h-0">
              Buy now
            </span>
          ) : (
            <Link
              href={checkoutHref}
              className="flex min-h-12 w-full items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)]/30 px-6 py-3.5 text-sm font-semibold transition hover:border-[var(--gold)]/40 hover:bg-[var(--nav-hover)] sm:w-auto sm:min-h-0"
            >
              Buy now
            </Link>
          )
        ) : null}
      </div>
      {cap !== null && !disabled ? (
        <p className="mt-2 text-center text-xs text-[var(--foreground-muted)] sm:text-left">
          {inCart > 0
            ? `${inCart} of ${cap} in cart`
            : `${cap} available`}
          {variantLabel ? ` (${variantLabel})` : ""}
        </p>
      ) : null}
    </div>
  );
}
