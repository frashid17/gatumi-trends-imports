import Link from "next/link";
import type { Metadata } from "next";
import { WishlistPageClient } from "@/app/wishlist/wishlist-page-client";

export const metadata: Metadata = {
  title: "Wishlist | Gatumi's Trends Imports",
  description: "Saved products — open an item to choose options and add to cart or buy now.",
};

export default function WishlistPage() {
  return (
    <div className="mx-auto max-w-6xl px-3 py-8 sm:px-6 sm:py-10">
      <h1 className="font-display text-2xl font-semibold text-[var(--foreground)] sm:text-3xl">
        Wishlist
      </h1>
      <p className="mt-2 text-sm text-[var(--foreground-muted)] sm:text-base">
        Saved on this device — tap a product to pick size or color and add to cart, or buy now from
        the product page or listing.
      </p>
      <WishlistPageClient />

      <p className="mt-8 text-xs text-[var(--foreground-muted)]">
        Prefer moving faster? Browse{" "}
        <Link href="/products" className="font-medium text-[var(--gold)] hover:underline">
          all products
        </Link>
        .
      </p>
    </div>
  );
}
