"use client";

import Image from "next/image";
import Link from "next/link";
import { useWishlist } from "@/components/wishlist/wishlist-context";

export function WishlistPageClient() {
  const { items, remove, ready } = useWishlist();

  if (!ready) {
    return <p className="mt-8 text-sm text-[var(--foreground-muted)]">Loading wishlist…</p>;
  }

  if (!items.length) {
    return (
      <div className="mt-10 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)]/60 p-10 text-center">
        <p className="text-[var(--foreground-muted)]">Nothing saved yet.</p>
        <p className="mt-2 text-sm text-[var(--foreground-muted)]">
          Tap the heart on a product card to save it here.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--gold)] px-6 py-3 text-sm font-semibold text-[var(--on-gold)] hover:bg-[var(--gold-hover)]"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
      {items.map((item) => (
        <li
          key={item.productId}
          className="flex gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 backdrop-blur-sm sm:p-4"
        >
          <Link
            href={`/product/${item.productId}`}
            className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[var(--surface-elevated)] sm:h-28 sm:w-28"
          >
            {item.image_url ? (
              <Image src={item.image_url} alt="" fill className="object-cover" sizes="112px" />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-[var(--foreground-muted)]">
                No image
              </div>
            )}
          </Link>
          <div className="min-w-0 flex flex-1 flex-col">
            <Link
              href={`/product/${item.productId}`}
              className="font-display font-semibold text-[var(--foreground)] hover:text-[var(--gold)] line-clamp-2"
            >
              {item.name}
            </Link>
            {item.price_hint ? (
              <p className="mt-1 text-sm text-[var(--gold)]">{item.price_hint}</p>
            ) : null}
            <div className="mt-auto flex flex-wrap gap-2 pt-3">
              <Link
                href={`/product/${item.productId}`}
                className="rounded-lg bg-[var(--gold)] px-3 py-2 text-xs font-semibold text-[var(--on-gold)] hover:bg-[var(--gold-hover)]"
              >
                View product
              </Link>
              <button
                type="button"
                className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-medium hover:bg-[var(--nav-hover)]"
                onClick={() => remove(item.productId)}
              >
                Remove
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
