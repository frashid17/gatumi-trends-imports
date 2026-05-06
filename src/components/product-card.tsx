import Image from "next/image";
import Link from "next/link";
import type { ProductRow, ProductVariantRow } from "@/lib/catalog";
import { priceOnRequestShort } from "@/lib/site";
import { SoldOutOverlay } from "@/components/sold-out-overlay";
import { ProductCardActions } from "@/components/product-card-actions";
import { ProductCardWishlist } from "@/components/product-card-wishlist";

export function ProductCard({
  product,
  categorySlug,
  variants = [],
}: {
  product: ProductRow;
  categorySlug: string;
  variants?: ProductVariantRow[];
}) {
  const stockLabel =
    product.stock_quantity != null
      ? product.stock_quantity <= 0
        ? "Out of stock"
        : `${product.stock_quantity} in stock`
      : null;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-lg shadow-black/10 backdrop-blur-sm transition hover:border-[var(--gold)]/30 hover:shadow-xl hover:shadow-black/20">
      <div className="relative aspect-[4/5] overflow-hidden rounded-t-2xl bg-[var(--surface-elevated)] sm:aspect-square">
        <Link
          href={`/product/${product.id}`}
          aria-label={product.sold_out ? `${product.name} (sold out)` : product.name}
          className="block h-full w-full"
        >
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className={`object-cover transition-transform duration-300 ${product.sold_out ? "opacity-90 saturate-[0.85]" : "group-hover:scale-[1.03]"}`}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-[var(--foreground-muted)]">
              No image
            </div>
          )}
        </Link>
        <ProductCardWishlist
          productId={product.id}
          name={product.name}
          image_url={product.image_url}
          price_hint={product.price_hint}
        />
        {product.sold_out ? <SoldOutOverlay /> : null}
      </div>

      <Link
        href={`/product/${product.id}`}
        className={`flex flex-1 flex-col p-4 sm:p-4 ${product.sold_out ? "text-[var(--foreground-muted)]" : ""}`}
      >
        <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--foreground-muted)] sm:text-xs">
          {categorySlug}
        </p>
        <h3
          className={`mt-1 font-display text-base font-semibold leading-snug line-clamp-2 sm:text-lg ${product.sold_out ? "text-[var(--foreground-muted)]" : "text-[var(--foreground)]"}`}
        >
          {product.name}
        </h3>
        {product.price_hint ? (
          <p className="mt-2 text-sm font-medium text-[var(--gold)]">{product.price_hint}</p>
        ) : (
          <p className="mt-2 text-sm text-[var(--foreground-muted)]">{priceOnRequestShort}</p>
        )}
        {stockLabel && !product.sold_out ? (
          <p className="mt-1 text-xs text-[var(--foreground-muted)]">{stockLabel}</p>
        ) : null}
      </Link>

      <ProductCardActions product={product} variants={variants} />
    </article>
  );
}
