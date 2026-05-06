import Link from "next/link";
import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { CheckoutClient } from "@/app/checkout/checkout-client";
import { getProductById, getVariantsForProduct, getWhatsAppNumberPublic } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Checkout | Gatumi's Trends Imports",
  description: "Complete your purchase via WhatsApp.",
};

type SearchParams = Promise<{ product?: string; variant?: string }>;

export default async function BuyNowCheckoutPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { product: productId = "", variant: variantId } = await searchParams;
  if (!productId.trim()) {
    redirect("/products");
  }

  let whatsappNumber = "";
  try {
    whatsappNumber = await getWhatsAppNumberPublic();
  } catch {
    whatsappNumber = "";
  }

  const [product, variants] = await Promise.all([
    getProductById(productId.trim()),
    getVariantsForProduct(productId.trim()),
  ]);

  if (!product) notFound();

  const user = await currentUser();
  const initialClientName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ").trim()
    : "";

  return (
    <div className="mx-auto max-w-6xl px-3 py-8 sm:px-6 sm:py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[var(--foreground)] sm:text-3xl">
            Buy now
          </h1>
          <p className="mt-1 text-sm text-[var(--foreground-muted)]">
            Confirm your item and send the order on WhatsApp — no cart step.
          </p>
        </div>
        <Link
          href={`/product/${product.id}`}
          className="text-sm font-medium text-[var(--gold)] hover:underline"
        >
          ← Product details
        </Link>
      </div>

      <CheckoutClient
        whatsappNumber={whatsappNumber}
        product={product}
        variants={variants}
        initialVariantId={variantId?.trim()}
        initialClientName={initialClientName}
      />
    </div>
  );
}
