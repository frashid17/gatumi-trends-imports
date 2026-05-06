"use client";

import Image from "next/image";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { applyCheckoutStockDecrement } from "@/app/cart/actions";
import { buildWhatsAppOrderUrl, normalizeWhatsAppNumber } from "@/lib/whatsapp";
import { buildWhatsAppOrderMessage } from "@/lib/order-message";
import { CURRENCY_CODE } from "@/lib/site";
import type { ProductRow, ProductVariantRow } from "@/lib/catalog";

function defaultVariantSelection(
  variants: ProductVariantRow[],
  preferredId: string | undefined,
): string {
  if (!variants.length) return "";
  if (preferredId) {
    const found = variants.find((v) => v.id === preferredId);
    if (found) return found.id;
  }
  const firstOpen = variants.find((v) => !v.sold_out);
  return (firstOpen ?? variants[0]).id;
}

export function CheckoutClient({
  whatsappNumber,
  product,
  variants,
  initialVariantId = "",
  initialClientName = "",
}: {
  whatsappNumber: string;
  product: ProductRow;
  variants: ProductVariantRow[];
  initialVariantId?: string;
  initialClientName?: string;
}) {
  const router = useRouter();
  const { user } = useUser();
  const [selectedVariantId, setSelectedVariantId] = useState(() =>
    defaultVariantSelection(variants, initialVariantId || undefined),
  );
  const [qty, setQty] = useState(1);
  const [clientName, setClientName] = useState(initialClientName);
  const [clientPhone, setClientPhone] = useState("");
  const [clientLocation, setClientLocation] = useState("");
  const [note, setNote] = useState("");
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [stockError, setStockError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  const selectedVariant =
    variants.find((v) => v.id === selectedVariantId) ?? (!variants.length ? null : variants[0]);

  const canSubmitLine = useMemo(() => {
    if (product.sold_out) return false;
    if (variants.length > 0) {
      if (!selectedVariant) return false;
      if (selectedVariant.sold_out) return false;
      if (selectedVariant.stock_quantity != null && selectedVariant.stock_quantity < qty) {
        return false;
      }
    } else {
      if (product.stock_quantity != null && product.stock_quantity < qty) return false;
    }
    return true;
  }, [product.sold_out, product.stock_quantity, variants.length, selectedVariant, qty]);

  const messageLines = useMemo(() => {
    const size = selectedVariant?.size ?? null;
    const color = selectedVariant?.color ?? null;
    return [
      {
        name: product.name,
        qty,
        price_hint: product.price_hint,
        size,
        color,
      },
    ];
  }, [product.name, product.price_hint, selectedVariant?.size, selectedVariant?.color, qty]);

  const message = useMemo(
    () =>
      buildWhatsAppOrderMessage({
        clientName,
        clientPhone,
        clientLocation,
        note,
        lines: messageLines,
        email: user?.primaryEmailAddress?.emailAddress ?? null,
      }),
    [
      clientName,
      clientPhone,
      clientLocation,
      note,
      messageLines,
      user?.primaryEmailAddress?.emailAddress,
    ],
  );

  const wa = normalizeWhatsAppNumber(whatsappNumber);
  const detailsComplete =
    clientName.trim().length > 0 &&
    clientPhone.trim().length > 0 &&
    clientLocation.trim().length > 0;

  async function submit() {
    if (!wa || !canSubmitLine) return;
    if (!detailsComplete) {
      setAttemptedSubmit(true);
      document.getElementById("buy-now-details")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    const variantId =
      variants.length > 0 ? selectedVariant?.id ?? null : null;

    const whatsappUrl = buildWhatsAppOrderUrl(whatsappNumber, message);
    setStockError(null);
    setApplying(true);
    try {
      const res = await applyCheckoutStockDecrement([
        { productId: product.id, variantId: variantId ?? undefined, qty },
      ]);
      if (!res.ok) {
        setStockError(res.error);
        return;
      }
      router.refresh();
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    } finally {
      setApplying(false);
    }
  }

  const fieldError =
    attemptedSubmit && !detailsComplete
      ? "Enter your name, phone, and location to continue."
      : null;

  const whatsappBtnClass = `flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold text-white transition ${
    !wa || applying || !canSubmitLine
      ? "cursor-not-allowed bg-slate-600 opacity-80"
      : "bg-[#25D366] hover:opacity-95 active:scale-[0.98]"
  }`;

  if (product.sold_out) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
        <p className="text-[var(--foreground-muted)]">This product is sold out.</p>
        <Link
          href="/products"
          className="mt-4 inline-block text-[var(--gold)] hover:underline"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3 lg:gap-10">
      <div className="space-y-4 lg:col-span-2">
        <div className="flex gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 backdrop-blur-sm">
          <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-[var(--surface-elevated)] sm:h-32 sm:w-32">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt=""
                fill
                className="object-cover"
                sizes="128px"
              />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <Link
              href={`/product/${product.id}`}
              className="font-display text-lg font-semibold text-[var(--foreground)] hover:text-[var(--gold)]"
            >
              {product.name}
            </Link>
            {product.price_hint ? (
              <p className="mt-1 text-sm text-[var(--gold)]">
                {product.price_hint}{" "}
                <span className="text-[var(--foreground-muted)]">({CURRENCY_CODE})</span>
              </p>
            ) : (
              <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                Price in {CURRENCY_CODE} on WhatsApp
              </p>
            )}
            {variants.length > 0 ? (
              <label className="mt-3 block text-sm">
                <span className="text-[var(--foreground-muted)]">Variant</span>
                <select
                  className="ui-select mt-1"
                  value={selectedVariantId}
                  onChange={(e) => setSelectedVariantId(e.target.value)}
                >
                  {variants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {[v.size, v.color].filter(Boolean).join(" / ") || "Option"}
                      {v.sold_out ? " (sold out)" : ""}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            {selectedVariant?.sold_out ? (
              <p className="mt-2 text-sm text-amber-200/90">This variant is sold out — pick another.</p>
            ) : null}
            <label className="mt-3 flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
              Qty
              <input
                type="number"
                min={1}
                max={
                  selectedVariant?.stock_quantity != null
                    ? selectedVariant.stock_quantity
                    : product.stock_quantity != null
                      ? product.stock_quantity
                      : undefined
                }
                inputMode="numeric"
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                className="ui-input w-20 py-2 text-center"
              />
            </label>
            {!canSubmitLine && variants.length === 0 && product.stock_quantity != null && qty > product.stock_quantity ? (
              <p className="mt-2 text-sm text-red-300">Not enough stock for this quantity.</p>
            ) : null}
            {!canSubmitLine &&
            variants.length > 0 &&
            selectedVariant &&
            selectedVariant.stock_quantity != null &&
            qty > selectedVariant.stock_quantity ? (
              <p className="mt-2 text-sm text-red-300">Not enough stock for this variant.</p>
            ) : null}
          </div>
        </div>
      </div>

      <div
        id="buy-now-details"
        className="h-fit scroll-mt-24 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6 lg:sticky lg:top-24"
      >
        <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">Checkout</h2>
        <p className="mt-2 text-sm text-[var(--foreground-muted)]">
          Buy now skips your cart — we&apos;ll send this item on WhatsApp. Tracked stock is updated when
          you open WhatsApp, same as the cart flow.
        </p>

        <div className="mt-4 space-y-3">
          <label className="block text-sm">
            <span className="text-[var(--foreground-muted)]">Your name *</span>
            <input
              type="text"
              autoComplete="name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="ui-input"
              placeholder="Full name"
            />
          </label>
          <label className="block text-sm">
            <span className="text-[var(--foreground-muted)]">Phone number *</span>
            <input
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              className="ui-input"
              placeholder="e.g. +254 712 345 678"
            />
          </label>
          <label className="block text-sm">
            <span className="text-[var(--foreground-muted)]">Location *</span>
            <input
              type="text"
              autoComplete="address-level2"
              value={clientLocation}
              onChange={(e) => setClientLocation(e.target.value)}
              className="ui-input"
              placeholder="Area, city, or delivery address"
            />
          </label>
          {fieldError ? <p className="text-sm text-amber-200/90">{fieldError}</p> : null}
          {stockError ? <p className="text-sm text-red-300">{stockError}</p> : null}
        </div>

        <label className="mt-4 block text-sm">
          <span className="text-[var(--foreground-muted)]">Note (optional)</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="ui-input mt-1 min-h-[5rem] resize-none"
            placeholder="Delivery preference…"
          />
        </label>

        {!wa ? (
          <p className="mt-4 text-sm text-amber-200/90">
            WhatsApp number is not configured yet. Ask the shop admin to set it in Admin → Settings.
          </p>
        ) : null}

        <button
          type="button"
          disabled={applying || !wa || !canSubmitLine}
          className={`${whatsappBtnClass} mt-6 w-full`}
          onClick={() => void submit()}
        >
          {applying
            ? "Updating stock…"
            : !canSubmitLine
              ? "Cannot complete — check stock or variant"
              : detailsComplete
                ? "Open WhatsApp with order"
                : "Enter details — tap to scroll"}
        </button>
      </div>
    </div>
  );
}
