import type { Metadata } from "next";
import { getAllProducts, getCategories, getVariantsByProductIds } from "@/lib/catalog";
import { ShopBrowseLayout } from "@/components/shop/shop-browse-layout";
import { ShopFilters } from "@/components/shop/shop-filters";
import { ProductGrid } from "@/components/shop/product-grid";
import { ProductGridCard } from "@/components/shop/product-grid-card";

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

  const showClear = Boolean(q || category || availability !== "all");

  let variantMap: Awaited<ReturnType<typeof getVariantsByProductIds>> = {};
  try {
    variantMap = await getVariantsByProductIds(filtered.map((p) => p.id));
  } catch {
    variantMap = {};
  }

  return (
    <ShopBrowseLayout
      categories={categories}
      activeSlug={null}
      title="All products"
      count={filtered.length}
      filters={
        <ShopFilters
          action="/products"
          q={q}
          availability={availability}
          clearHref="/products"
          showClear={showClear}
          searchPlaceholder="Search name, category, description…"
        />
      }
    >
      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-[var(--foreground-muted)]">No products yet.</p>
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
