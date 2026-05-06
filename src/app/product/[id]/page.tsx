import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCategories, getProductById, getVariantsForProduct } from "@/lib/catalog";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { SoldOutOverlay } from "@/components/sold-out-overlay";
import { CURRENCY_CODE, priceConfirmedWhatsApp } from "@/lib/site";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) {
    return { title: "Product not found | Gatumi's Trends Imports" };
  }
  return {
    title: `${product.name} | Gatumi's Trends Imports`,
    description:
      product.description?.trim() ||
      `Shop ${product.name} at Gatumi's Trends Imports. Prices confirmed on WhatsApp in ${CURRENCY_CODE}.`,
    openGraph: {
      title: product.name,
      description:
        product.description?.trim() ||
        `Shop ${product.name} at Gatumi's Trends Imports.`,
      images: product.image_url ? [product.image_url] : undefined,
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  const [categories, variants] = await Promise.all([getCategories(), getVariantsForProduct(id)]);
  const category = categories.find((c) => c.id === product.category_id);

  return (
    <div className="mx-auto max-w-6xl px-3 pb-28 pt-6 sm:px-6 sm:pb-10 sm:pt-10 lg:pb-10">
      <Link
        href={category ? `/shop/${category.slug}` : "/shop"}
        className="inline-flex min-h-11 items-center text-sm font-medium text-[var(--gold)] hover:underline"
      >
        ← Back to {category?.name ?? "shop"}
      </Link>

      <div className="mt-6 grid gap-8 lg:mt-8 lg:grid-cols-2 lg:gap-10">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] sm:aspect-square">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className={product.sold_out ? "object-cover opacity-90 saturate-[0.85]" : "object-cover"}
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[var(--foreground-muted)]">
              No image
            </div>
          )}
          {product.sold_out ? <SoldOutOverlay /> : null}
        </div>

        <div className="flex flex-col lg:pb-0">
          {category ? (
            <p className="text-sm text-[var(--foreground-muted)]">{category.name}</p>
          ) : null}
          <h1 className="font-display mt-2 text-2xl font-bold leading-tight text-[var(--foreground)] sm:text-3xl lg:text-4xl">
            {product.name}
          </h1>
          {product.price_hint ? (
            <p className="mt-4 text-lg font-semibold text-[var(--gold)] sm:text-xl">
              {product.price_hint}
              <span className="ml-2 text-sm font-normal text-[var(--foreground-muted)]">
                ({CURRENCY_CODE})
              </span>
            </p>
          ) : (
            <p className="mt-4 text-base text-[var(--foreground-muted)]">{priceConfirmedWhatsApp}</p>
          )}
          <div className="mt-5 max-w-none text-base leading-relaxed text-[var(--foreground-muted)] whitespace-pre-wrap sm:mt-6">
            {product.description || "No description yet."}
          </div>

          {variants.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {variants.map((v) => (
                <span
                  key={v.id}
                  className={`rounded-full border px-3 py-1 text-xs ${
                    v.sold_out
                      ? "border-amber-500/40 bg-amber-500/15 text-amber-200"
                      : "border-[var(--border)] bg-[var(--surface-elevated)]/40 text-[var(--foreground-muted)]"
                  }`}
                >
                  {[v.size, v.color].filter(Boolean).join(" / ") || "Variant"}
                  {v.sold_out ? " • Sold out" : ""}
                </span>
              ))}
            </div>
          ) : null}

          {product.stock_quantity != null ? (
            <p className="mt-4 text-sm text-[var(--foreground-muted)]">
              {product.stock_quantity <= 0
                ? "No units left in tracked stock."
                : `${product.stock_quantity} in stock (updated when customers send an order on WhatsApp).`}
            </p>
          ) : null}

          <div className="mt-8 hidden lg:mt-10 lg:block">
            <AddToCartButton
              disabled={product.sold_out}
              stockQuantity={product.stock_quantity}
              variants={variants}
              showBuyNow
              product={{
                productId: product.id,
                name: product.name,
                image_url: product.image_url,
                price_hint: product.price_hint,
              }}
            />
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border)] bg-[var(--background)]/92 p-3 backdrop-blur-xl supports-[backdrop-filter]:bg-[var(--background)]/80 lg:hidden">
        <div className="pb-[max(0.25rem,env(safe-area-inset-bottom))]">
          <AddToCartButton
            disabled={product.sold_out}
            stockQuantity={product.stock_quantity}
            variants={variants}
            showBuyNow
            product={{
              productId: product.id,
              name: product.name,
              image_url: product.image_url,
              price_hint: product.price_hint,
            }}
          />
        </div>
      </div>
    </div>
  );
}
