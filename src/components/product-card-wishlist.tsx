"use client";

import { useWishlist } from "@/components/wishlist/wishlist-context";

export function ProductCardWishlist({
  productId,
  name,
  image_url,
  price_hint,
  disabled,
}: {
  productId: string;
  name: string;
  image_url: string | null;
  price_hint: string | null;
  disabled?: boolean;
}) {
  const { has, toggle, ready } = useWishlist();
  const saved = has(productId);

  return (
    <button
      type="button"
      disabled={disabled || !ready}
      aria-pressed={saved}
      aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
      title={saved ? "Remove from wishlist" : "Save to wishlist"}
      className={`absolute right-2 top-2 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] shadow-md backdrop-blur-sm transition ${
        disabled
          ? "cursor-not-allowed opacity-40"
          : "bg-[var(--surface-solid)]/90 hover:border-[var(--gold)]/50 hover:bg-[var(--surface-elevated)]"
      } ${saved ? "text-red-400" : "text-[var(--foreground-muted)]"}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (disabled) return;
        toggle({ productId, name, image_url, price_hint });
      }}
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} aria-hidden>
        <path
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}
