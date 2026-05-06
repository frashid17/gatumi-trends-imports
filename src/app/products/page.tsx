import Link from "next/link";
import type { Metadata } from "next";
import { getAllProducts, getCategories, getVariantsByProductIds } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";

type SearchParams = Promise<{
  q?: string;
  category?: string;
  availability?: string;
}>;

export const metadata: Metadata = {
  title: "All Products | Gatumi's Trends Imports",
  description:
    "Browse all products at Gatumi's Trends Imports. Filter by category and availability.",
};

export default async function AllProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const { q = "", category = "", availability = "all" } = await searchParams;
  const [products, categories] = await Promise.all([getAllProducts(), getCategories()]);
  const categoryNameById = Object.fromEntries(categories.map((c) => [c.id, c.name]));
  const needle = q.trim().toLowerCase();
  const filtered = products.filter((p) => {
    const categoryName = p.category_id ? categoryNameById[p.category_id] ?? "" : "";
    const matchesQuery =
      !needle ||
      p.name.toLowerCase().includes(needle) ||
      categoryName.toLowerCase().includes(needle) ||
      p.description.toLowerCase().includes(needle);
    const matchesCategory = !category || p.category_id === category;
    const matchesAvailability =
      availability === "all"
        ? true
        : availability === "in-stock"
          ? !p.sold_out
          : p.sold_out;
    return matchesQuery && matchesCategory && matchesAvailability;
  });

  let variantMap: Awaited<ReturnType<typeof getVariantsByProductIds>> = {};
  try {
    variantMap = await getVariantsByProductIds(filtered.map((p) => p.id));
  } catch {
    variantMap = {};
  }

  return (
    <div className="mx-auto max-w-6xl px-3 py-6 sm:px-6 sm:py-10">
      <h1 className="font-display text-2xl font-semibold text-[var(--foreground)] sm:text-3xl">
        All products
      </h1>
      <p className="mt-2 text-sm text-[var(--foreground-muted)] sm:text-base">
        Everything in the catalog — newest first.
      </p>
      <form className="mt-6 grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 backdrop-blur-sm sm:grid-cols-[1fr_auto_auto_auto]">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name, category, description…"
          className="ui-input mt-0"
        />
        <select name="category" defaultValue={category} className="ui-select mt-0 min-w-[11rem]">
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          name="availability"
          defaultValue={availability}
          className="ui-select mt-0 min-w-[10rem]"
        >
          <option value="all">All</option>
          <option value="in-stock">In stock</option>
          <option value="sold-out">Sold out</option>
        </select>
        <button
          type="submit"
          className="rounded-xl bg-[var(--gold)] px-4 py-2.5 text-sm font-semibold text-[var(--on-gold)] transition hover:bg-[var(--gold-hover)]"
        >
          Apply
        </button>
      </form>
      {(q || category || availability !== "all") && (
        <div className="mt-3">
          <Link href="/products" className="text-sm font-medium text-[var(--gold)] hover:underline">
            Clear filters
          </Link>
        </div>
      )}
      {filtered.length === 0 ? (
        <p className="mt-10 text-[var(--foreground-muted)]">No products yet.</p>
      ) : (
        <ul className="mt-8 grid grid-cols-1 gap-5 sm:mt-10 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {filtered.map((p) => (
            <li key={p.id}>
              <ProductCard
                product={p}
                categorySlug={
                  p.category_id
                    ? categoryNameById[p.category_id] ?? "Uncategorized"
                    : "Shop"
                }
                variants={variantMap[p.id] ?? []}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
