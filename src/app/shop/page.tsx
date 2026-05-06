import Link from "next/link";
import type { Metadata } from "next";
import { getCategories } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Shop Categories | Gatumi's Trends Imports",
  description: "Browse product categories at Gatumi's Trends Imports.",
};

export default async function ShopIndexPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-6xl px-3 py-6 sm:px-6 sm:py-10">
      <h1 className="font-display text-2xl font-semibold text-[var(--foreground)] sm:text-3xl">
        Shop by category
      </h1>
      <p className="mt-2 text-sm text-[var(--foreground-muted)] sm:text-base">
        Choose a category to see products.
      </p>
      <ul className="mt-8 grid grid-cols-1 gap-2 sm:mt-10 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
        {categories.map((c) => (
          <li key={c.id}>
            <Link
              href={`/shop/${c.slug}`}
              className="flex min-h-14 items-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 backdrop-blur-sm transition active:scale-[0.99] hover:border-[var(--gold)]/35 hover:bg-[var(--nav-hover)] sm:min-h-0 sm:px-5 sm:py-4"
            >
              <span className="font-medium text-[var(--foreground)]">{c.name}</span>
              <span className="ml-auto text-sm text-[var(--gold)]">→</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
