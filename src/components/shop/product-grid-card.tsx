import Image from "next/image";
import Link from "next/link";
import type { ProductRow, ProductVariantRow } from "@/lib/catalog";
import { priceOnRequestShort } from "@/lib/site";
import { SoldOutOverlay } from "@/components/sold-out-overlay";
import { ProductCardWishlist } from "@/components/product-card-wishlist";
import { ProductCardActions } from "@/components/product-card-actions";

export function ProductGridCard({
  product,
  variants = [],
}: {
  product: ProductRow;
  variants?: ProductVariantRow[];
}) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-[var(--border)]/80 bg-[var(--surface)] shadow-sm transition hover:border-[var(--gold)]/30">
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-[var(--surface-elevated)]">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className={`object-cover transition-transform duration-300 ${product.sold_out ? "opacity-90 saturate-[0.85]" : "group-hover:scale-[1.03]"}`}
              sizes="33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-1 text-center text-[10px] text-[var(--foreground-muted)]">
              No image
            </div>
          )}
          <ProductCardWishlist
            productId={product.id}
            name={product.name}
            image_url={product.image_url}
            price_hint={product.price_hint}
            disabled={product.sold_out}
            compact
          />
          {product.sold_out ? <SoldOutOverlay /> : null}
        </div>
        <div className="space-y-0.5 px-1.5 py-2 sm:px-2 sm:py-2.5">
          <h3 className="line-clamp-2 text-[11px] font-medium leading-snug text-[var(--foreground)] sm:text-xs">
            {product.name}
          </h3>
          {product.price_hint ? (
            <p className="line-clamp-1 text-[10px] font-semibold text-[var(--gold)] sm:text-[11px]">
              {product.price_hint}
            </p>
          ) : (
            <p className="line-clamp-1 text-[10px] text-[var(--foreground-muted)] sm:text-[11px]">
              {priceOnRequestShort}
            </p>
          )}
        </div>
      </Link>
      <ProductCardActions product={product} variants={variants} compact />
    </article>
  );
}
