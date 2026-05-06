import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getCategoryBySlug,
  getProductsByCategory,
  getVariantsByProductIds,
} from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";

type Props = { params: Promise<{ slug: string }> };
type SearchParams = Promise<{ q?: string; availability?: string }>;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Category not found | Gatumi's Trends Imports" };
  return {
    title: `${category.name} | Gatumi's Trends Imports`,
    description: `Shop ${category.name} at Gatumi's Trends Imports.`,
  };
}

export default async function CategoryShopPage({ params, searchParams }: { params: Props["params"]; searchParams: SearchParams }) {
  const { slug } = await params;
  const { q = "", availability = "all" } = await searchParams;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const products = await getProductsByCategory(category.id);
  const needle = q.trim().toLowerCase();
  const filtered = products.filter((p) => {
    const matchesQ = !needle || p.name.toLowerCase().includes(needle) || p.description.toLowerCase().includes(needle);
    const matchesAvailability =
      availability === "all" ? true : availability === "in-stock" ? !p.sold_out : p.sold_out;
    return matchesQ && matchesAvailability;
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
        {category.name}
      </h1>
      <p className="mt-2 text-sm text-[var(--foreground-muted)] sm:text-base">
        {filtered.length} product{filtered.length === 1 ? "" : "s"}
      </p>
      <form className="mt-6 grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 backdrop-blur-sm sm:grid-cols-[1fr_auto_auto]">
        <input
          name="q"
          defaultValue={q}
          placeholder={`Search in ${category.name}...`}
          className="ui-input mt-0"
        />
        <select name="availability" defaultValue={availability} className="ui-select mt-0 min-w-[10rem]">
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
      {(q || availability !== "all") && (
        <div className="mt-3">
          <Link
            href={`/shop/${category.slug}`}
            className="text-sm font-medium text-[var(--gold)] hover:underline"
          >
            Clear filters
          </Link>
        </div>
      )}
      {filtered.length === 0 ? (
        <p className="mt-8 text-[var(--foreground-muted)]">No products in this category yet.</p>
      ) : (
        <ul className="mt-8 grid grid-cols-1 gap-5 sm:mt-10 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {filtered.map((p) => (
            <li key={p.id}>
              <ProductCard
                product={p}
                categorySlug={category.name}
                variants={variantMap[p.id] ?? []}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
