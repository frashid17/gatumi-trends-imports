import Link from "next/link";
import type { Metadata } from "next";
import {
  getCategories,
  getFeaturedProducts,
  getVariantsByProductIds,
} from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";
import { CURRENCY_CODE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Gatumi's Trends Imports | Shop via WhatsApp",
  description:
    "Curated imports across fashion, home, and more. Browse products and send your order on WhatsApp.",
};

export default async function HomePage() {
  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  let featured: Awaited<ReturnType<typeof getFeaturedProducts>> = [];
  let error: string | null = null;
  try {
    categories = await getCategories();
  } catch {
    error =
      "We could not load categories. Check your Supabase URL and keys in .env.local.";
  }

  try {
    featured = await getFeaturedProducts(8);
  } catch {
    featured = [];
  }

  let featuredVariants: Awaited<ReturnType<typeof getVariantsByProductIds>> = {};
  try {
    featuredVariants = await getVariantsByProductIds(featured.map((p) => p.id));
  } catch {
    featuredVariants = {};
  }

  return (
    <div className="relative">
      <section className="relative mx-auto max-w-6xl px-3 pb-12 pt-6 sm:px-6 sm:pb-20 sm:pt-14">
        <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[11px] font-medium leading-snug text-[var(--foreground-muted)] backdrop-blur-sm sm:px-4 sm:text-sm">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--gold)]" aria-hidden />
          <span className="min-w-0">
            Quality imports · Trendy styles · Prices in {CURRENCY_CODE} on WhatsApp
          </span>
        </div>

        <h1 className="font-display mt-6 max-w-4xl text-[2rem] font-bold leading-[1.12] tracking-tight text-[var(--foreground)] sm:mt-8 sm:text-5xl lg:text-6xl">
          Style that travels.
          <span className="block text-[var(--gold)]">Deals that feel personal.</span>
        </h1>

        <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-[var(--foreground-muted)] sm:mt-6 sm:text-lg">
          Browse curated categories on your phone, build your cart, then WhatsApp us. We&apos;ll
          confirm availability and your total in {CURRENCY_CODE}.
        </p>

        <div className="mt-8 flex w-full flex-col gap-3 sm:mt-10 sm:w-auto sm:flex-row sm:flex-wrap sm:gap-4">
          <Link
            href="/products"
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--gold)] px-6 py-3.5 text-sm font-semibold text-[var(--on-gold)] shadow-lg shadow-[var(--gold)]/15 transition hover:bg-[var(--gold-hover)] active:scale-[0.98] sm:w-auto"
          >
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Browse collection
          </Link>
          <Link
            href="/shop"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-[var(--border)] bg-transparent px-6 py-3.5 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--gold)]/40 hover:bg-[var(--nav-hover)] active:scale-[0.98] sm:w-auto"
          >
            View categories
          </Link>
        </div>

        <div className="mt-12 border-t border-[var(--border)] pt-8 sm:mt-16 sm:pt-10">
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 sm:gap-8">
            {[
              { n: String(categories.length || "—"), l: "Categories" },
              { n: CURRENCY_CODE, l: "Kenya Shillings" },
              { n: "WhatsApp", l: "Order & quotes" },
              { n: "24/7", l: "Browse on mobile" },
            ].map((s) => (
              <div key={s.l}>
                <p className="font-display text-xl font-bold text-[var(--gold)] sm:text-3xl">{s.n}</p>
                <p className="mt-1 text-xs text-[var(--foreground-muted)] sm:text-sm">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {featured.length > 0 ? (
        <section className="mx-auto max-w-6xl px-3 pb-12 sm:px-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold text-[var(--foreground)] sm:text-3xl">
                New arrivals
              </h2>
              <p className="mt-1 text-sm text-[var(--foreground-muted)] sm:text-base">
                A taste of what we&apos;re stocking — tap through to shop.
              </p>
            </div>
            <Link
              href="/products"
              className="text-sm font-medium text-[var(--gold)] hover:underline sm:shrink-0"
            >
              See all products →
            </Link>
          </div>
          <ul className="mt-8 grid grid-cols-1 gap-5 sm:mt-10 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {featured.map((p) => (
              <li key={p.id}>
                <ProductCard
                  product={p}
                  categorySlug={p.categoryName ?? "Featured"}
                  variants={featuredVariants[p.id] ?? []}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-3 pb-16 sm:px-6 sm:pb-20">
        <h2 className="font-display text-xl font-semibold text-[var(--foreground)] sm:text-3xl">
          Shop by category
        </h2>
        <p className="mt-2 text-sm text-[var(--foreground-muted)] sm:text-base">
          Tap a category — built for quick browsing on your phone.
        </p>

        {error ? (
          <p className="mt-8 rounded-xl border border-red-500/30 bg-red-950/40 p-4 text-sm text-red-200">
            {error}
          </p>
        ) : (
          <ul className="mt-8 grid grid-cols-1 gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/shop/${c.slug}`}
                  className="group relative block min-h-[100px] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 backdrop-blur-sm transition active:scale-[0.99] sm:min-h-0 sm:p-6 hover:border-[var(--gold)]/35 hover:shadow-lg hover:shadow-black/20"
                >
                  <span className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[var(--gold)]/10 transition group-hover:bg-[var(--gold)]/20" aria-hidden />
                  <h3 className="font-display relative text-base font-semibold text-[var(--foreground)] sm:text-lg">
                    {c.name}
                  </h3>
                  <p className="relative mt-2 text-sm text-[var(--foreground-muted)]">
                    Explore {c.name.toLowerCase()}
                  </p>
                  <span className="relative mt-4 inline-flex items-center text-sm font-medium text-[var(--gold)]">
                    Shop now
                    <span className="ml-1 transition group-hover:translate-x-0.5" aria-hidden>
                      →
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
