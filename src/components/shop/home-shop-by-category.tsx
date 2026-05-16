"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ProductRow, ProductVariantRow } from "@/lib/catalog";
import { ProductGrid } from "@/components/shop/product-grid";
import { ProductGridCard } from "@/components/shop/product-grid-card";
import type { ShopCategory } from "@/components/shop/category-tabs";

const HOME_GRID_LIMIT = 24;

type Props = {
  categories: ShopCategory[];
  products: ProductRow[];
  variantMap?: Record<string, ProductVariantRow[]>;
};

function tabClass(active: boolean) {
  return [
    "shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
    active
      ? "border-[var(--gold)] text-[var(--foreground)]"
      : "border-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)]",
  ].join(" ");
}

export function HomeShopByCategory({ categories, products, variantMap = {} }: Props) {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  const activeCategory = activeCategoryId
    ? categories.find((c) => c.id === activeCategoryId)
    : null;

  const visible = useMemo(() => {
    const list = activeCategoryId
      ? products.filter((p) => p.category_id === activeCategoryId)
      : products;
    return list.slice(0, HOME_GRID_LIMIT);
  }, [products, activeCategoryId]);

  const totalInSelection = useMemo(() => {
    if (!activeCategoryId) return products.length;
    return products.filter((p) => p.category_id === activeCategoryId).length;
  }, [products, activeCategoryId]);

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
      <div
        className="flex overflow-x-auto overscroll-x-contain scroll-smooth border-b border-[var(--border)] px-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="Product categories"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeCategoryId === null}
          className={tabClass(activeCategoryId === null)}
          onClick={() => setActiveCategoryId(null)}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={activeCategoryId === c.id}
            className={tabClass(activeCategoryId === c.id)}
            onClick={() => setActiveCategoryId(c.id)}
          >
            {c.name}
          </button>
        ))}
      </div>

      {activeCategory ? (
        <div className="border-b border-[var(--border)]/60 px-3 py-2">
          <span className="inline-flex max-w-full items-center rounded-full border border-[var(--gold)]/35 bg-[var(--gold)]/10 px-3 py-1 text-xs font-medium text-[var(--gold)]">
            {activeCategory.name}
          </span>
        </div>
      ) : null}

      <div className="p-3 sm:p-4">
        {visible.length === 0 ? (
          <p className="py-10 text-center text-sm text-[var(--foreground-muted)]">
            No products in this category yet.
          </p>
        ) : (
          <ProductGrid>
            {visible.map((p) => (
              <li key={p.id}>
                <ProductGridCard product={p} variants={variantMap[p.id] ?? []} />
              </li>
            ))}
          </ProductGrid>
        )}

        {totalInSelection > HOME_GRID_LIMIT ? (
          <p className="mt-3 text-center text-xs text-[var(--foreground-muted)]">
            Showing {HOME_GRID_LIMIT} of {totalInSelection} items
          </p>
        ) : null}

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {activeCategory ? (
            <Link
              href={`/shop/${activeCategory.slug}`}
              className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--gold)]/40 hover:bg-[var(--nav-hover)]"
            >
              View all in {activeCategory.name}
            </Link>
          ) : null}
          <Link
            href={activeCategory ? `/shop/${activeCategory.slug}` : "/products"}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-[var(--gold)] px-4 py-3 text-sm font-semibold text-[var(--on-gold)] transition hover:bg-[var(--gold-hover)] active:scale-[0.98]"
          >
            {activeCategory ? "Open full catalog" : "Browse all products"}
          </Link>
        </div>
      </div>
    </div>
  );
}
