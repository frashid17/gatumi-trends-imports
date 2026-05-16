import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getCategories,
  getCategoryBySlug,
  getProductsByCategory,
  getVariantsByProductIds,
} from "@/lib/catalog";
import { ShopBrowseLayout } from "@/components/shop/shop-browse-layout";
import { ShopFilters } from "@/components/shop/shop-filters";
import { ProductGrid } from "@/components/shop/product-grid";
import { ProductGridCard } from "@/components/shop/product-grid-card";

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

export default async function CategoryShopPage({
  params,
  searchParams,
}: {
  params: Props["params"];
  searchParams: SearchParams;
}) {
  const { slug } = await params;
  const { q = "", availability = "all" } = await searchParams;
  const [category, categories] = await Promise.all([
    getCategoryBySlug(slug),
    getCategories(),
  ]);
  if (!category) notFound();

  const products = await getProductsByCategory(category.id);
  const needle = q.trim().toLowerCase();
  const filtered = products.filter((p) => {
    const matchesQ =
      !needle || p.name.toLowerCase().includes(needle) || p.description.toLowerCase().includes(needle);
    const matchesAvailability =
      availability === "all" ? true : availability === "in-stock" ? !p.sold_out : p.sold_out;
    return matchesQ && matchesAvailability;
  });

  const showClear = Boolean(q || availability !== "all");

  let variantMap: Awaited<ReturnType<typeof getVariantsByProductIds>> = {};
  try {
    variantMap = await getVariantsByProductIds(filtered.map((p) => p.id));
  } catch {
    variantMap = {};
  }

  return (
    <ShopBrowseLayout
      categories={categories}
      activeSlug={slug}
      title={category.name}
      count={filtered.length}
      filters={
        <ShopFilters
          action={`/shop/${category.slug}`}
          q={q}
          availability={availability}
          clearHref={`/shop/${category.slug}`}
          showClear={showClear}
          searchPlaceholder={`Search in ${category.name}…`}
        />
      }
    >
      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-[var(--foreground-muted)]">
          No products in this category yet.
        </p>
      ) : (
        <ProductGrid>
          {filtered.map((p) => (
            <li key={p.id}>
              <ProductGridCard product={p} variants={variantMap[p.id] ?? []} />
            </li>
          ))}
        </ProductGrid>
      )}
    </ShopBrowseLayout>
  );
}
