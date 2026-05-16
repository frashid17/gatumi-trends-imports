"use client";

import Link from "next/link";

export type ShopCategory = {
  id: string;
  name: string;
  slug: string;
};

type Props = {
  categories: ShopCategory[];
  /** Slug of the active category, or `null` for “All”. */
  activeSlug: string | null;
};

function tabClass(active: boolean) {
  return [
    "shrink-0 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors",
    active
      ? "border-[var(--gold)] text-[var(--foreground)]"
      : "border-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)]",
  ].join(" ");
}

export function CategoryTabs({ categories, activeSlug }: Props) {
  const activeCategory = activeSlug
    ? categories.find((c) => c.slug === activeSlug)
    : null;

  return (
    <div className="sticky top-[3.25rem] z-30 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-md md:top-[4.25rem]">
      <div
        className="flex overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="Product categories"
      >
        <Link href="/products" role="tab" aria-selected={!activeSlug} className={tabClass(!activeSlug)}>
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/shop/${c.slug}`}
            role="tab"
            aria-selected={activeSlug === c.slug}
            className={tabClass(activeSlug === c.slug)}
          >
            {c.name}
          </Link>
        ))}
      </div>
      {activeCategory ? (
        <div className="border-t border-[var(--border)]/60 px-3 py-2 sm:px-0">
          <span className="inline-flex max-w-full items-center rounded-full border border-[var(--gold)]/35 bg-[var(--gold)]/10 px-3 py-1 text-xs font-medium text-[var(--gold)]">
            {activeCategory.name}
          </span>
        </div>
      ) : null}
    </div>
  );
}
