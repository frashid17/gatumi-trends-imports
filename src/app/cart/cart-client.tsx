"use client";

import Image from "next/image";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useCart } from "@/components/cart/cart-context";
import { buildWhatsAppOrderUrl, normalizeWhatsAppNumber } from "@/lib/whatsapp";
import { buildWhatsAppOrderMessage } from "@/lib/order-message";
import { CURRENCY_CODE } from "@/lib/site";
import { applyCheckoutStockDecrement } from "@/app/cart/actions";

export function CartClient({
  whatsappNumber,
  initialClientName = "",
}: {
  whatsappNumber: string;
  initialClientName?: string;
}) {
  const router = useRouter();
  const { lines, setQty, removeLine, totalItems, clear } = useCart();
  const { user } = useUser();
  const [clientName, setClientName] = useState(initialClientName);
  const [clientPhone, setClientPhone] = useState("");
  const [clientLocation, setClientLocation] = useState("");
  const [note, setNote] = useState("");
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [stockError, setStockError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  const message = useMemo(
    () =>
      buildWhatsAppOrderMessage({
        clientName,
        clientPhone,
        clientLocation,
        note,
        lines: lines.map((l) => ({
          name: l.name,
          qty: l.qty,
          price_hint: l.price_hint,
          size: l.size,
          color: l.color,
        })),
        email: user?.primaryEmailAddress?.emailAddress ?? null,
      }),
    [clientName, clientPhone, clientLocation, note, lines, user],
  );

  const wa = normalizeWhatsAppNumber(whatsappNumber);
  const detailsComplete =
    clientName.trim().length > 0 &&
    clientPhone.trim().length > 0 &&
    clientLocation.trim().length > 0;
  const fieldError =
    attemptedSubmit && !detailsComplete
      ? "Enter your name, phone, and location to continue."
      : null;

  async function openWhatsAppCheckout() {
    if (!wa || !lines.length) return;
    if (!detailsComplete) {
      setAttemptedSubmit(true);
      document
        .getElementById("checkout-details")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const whatsappUrl = buildWhatsAppOrderUrl(whatsappNumber, message);

    setStockError(null);
    setApplying(true);
    try {
      const res = await applyCheckoutStockDecrement(
        lines.map((l) => ({ productId: l.productId, variantId: l.variantId, qty: l.qty })),
      );
      if (!res.ok) {
        setStockError(res.error);
        return;
      }
      clear();
      router.refresh();
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    } finally {
      setApplying(false);
    }
  }

  if (lines.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center backdrop-blur-sm sm:p-12">
        <p className="text-[var(--foreground-muted)]">Your cart is empty.</p>
        <Link
          href="/shop"
          className="mt-6 inline-flex min-h-12 w-full max-w-xs items-center justify-center rounded-xl bg-[var(--gold)] px-6 py-3 text-sm font-semibold text-[var(--on-gold)] transition hover:bg-[var(--gold-hover)] active:scale-[0.98] sm:w-auto"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  const whatsappBtnClass = `flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold text-white transition ${
    !wa || applying
      ? "cursor-not-allowed bg-slate-600 opacity-80"
      : "bg-[#25D366] hover:opacity-95 active:scale-[0.98]"
  }`;

  const customerFields = (
    <div className="space-y-3">
      <label className="block text-sm">
        <span className="text-[var(--foreground-muted)]">Your name *</span>
        <input
          type="text"
          name="client_name"
          autoComplete="name"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          className="ui-input"
          placeholder="Full name"
          required
        />
      </label>
      <label className="block text-sm">
        <span className="text-[var(--foreground-muted)]">Phone number *</span>
        <input
          type="tel"
          name="client_phone"
          autoComplete="tel"
          inputMode="tel"
          value={clientPhone}
          onChange={(e) => setClientPhone(e.target.value)}
          className="ui-input"
          placeholder="e.g. +254 712 345 678"
          required
        />
      </label>
      <label className="block text-sm">
        <span className="text-[var(--foreground-muted)]">Location *</span>
        <input
          type="text"
          name="client_location"
          autoComplete="address-level2"
          value={clientLocation}
          onChange={(e) => setClientLocation(e.target.value)}
          className="ui-input"
          placeholder="Area, city, or delivery address"
          required
        />
      </label>
      {fieldError ? <p className="text-sm text-amber-200/90">{fieldError}</p> : null}
      {stockError ? <p className="text-sm text-red-300">{stockError}</p> : null}
    </div>
  );

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-3 lg:gap-10">
        <div className="space-y-3 lg:col-span-2 sm:space-y-4">
          {lines.map((line) => (
            <div
              key={line.lineId}
              className="flex gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 backdrop-blur-sm sm:gap-4 sm:p-4"
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[var(--surface-elevated)] sm:h-24 sm:w-24">
                {line.image_url ? (
                  <Image src={line.image_url} alt="" fill className="object-cover" sizes="96px" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/product/${line.productId}`}
                  className="font-display text-base font-semibold text-[var(--foreground)] hover:text-[var(--gold)] sm:text-lg"
                >
                  {line.name}
                </Link>
                {line.price_hint ? (
                  <p className="text-sm text-[var(--gold)]">
                    {line.price_hint}{" "}
                    <span className="text-[var(--foreground-muted)]">({CURRENCY_CODE})</span>
                  </p>
                ) : (
                  <p className="text-sm text-[var(--foreground-muted)]">
                    Price in {CURRENCY_CODE} on WhatsApp
                  </p>
                )}
                {line.size || line.color ? (
                  <p className="mt-1 text-xs text-[var(--foreground-muted)]">
                    Variant: {[line.size, line.color].filter(Boolean).join(" / ")}
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
                    Qty
                    <input
                      type="number"
                      min={1}
                      inputMode="numeric"
                      value={line.qty}
                      onChange={(e) => setQty(line.lineId, Number(e.target.value) || 1)}
                      className="ui-input w-16 min-w-[3.5rem] py-2 text-center"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => removeLine(line.lineId)}
                    className="min-h-10 text-sm font-medium text-red-400 hover:text-red-300 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          id="checkout-details"
          className="h-fit scroll-mt-24 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 backdrop-blur-sm sm:p-6 lg:sticky lg:top-24"
        >
          <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">Checkout</h2>
          <p className="mt-2 text-sm text-[var(--foreground-muted)]">
            {totalItems} item{totalItems === 1 ? "" : "s"}. Add your details — they&apos;ll be sent
            with your order on WhatsApp. For items with tracked stock, we reduce quantity when you
            open WhatsApp (you can fix stock in Admin if the sale doesn&apos;t complete).
          </p>

          <div className="mt-4">{customerFields}</div>

          <label className="mt-4 block text-sm">
            <span className="text-[var(--foreground-muted)]">Note (optional)</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="ui-input mt-1 min-h-[5rem] resize-none"
              placeholder="Size, color, delivery preference…"
            />
          </label>

          {!wa ? (
            <p className="mt-4 text-sm text-amber-200/90">
              WhatsApp number is not configured yet. Ask the shop admin to set it in Admin →
              Settings.
            </p>
          ) : null}

          <button
            type="button"
            disabled={applying || !wa}
            className={`${whatsappBtnClass} mt-6 hidden lg:flex`}
            onClick={() => void openWhatsAppCheckout()}
          >
            {applying ? "Updating stock…" : "Open WhatsApp with order"}
          </button>
          <p className="mt-3 hidden text-xs text-[var(--foreground-muted)] lg:block">
            Your name, phone, location, items, and prices are included in the message.
          </p>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border)] bg-[var(--background)]/92 p-3 backdrop-blur-xl supports-[backdrop-filter]:bg-[var(--background)]/80 lg:hidden">
        <div className="mx-auto max-w-6xl space-y-2 pb-[max(0.25rem,env(safe-area-inset-bottom))]">
          {!wa ? (
            <p className="text-center text-xs text-amber-200/90">Set WhatsApp in Admin → Settings.</p>
          ) : null}
          <button
            type="button"
            disabled={applying || !wa}
            className={whatsappBtnClass}
            onClick={() => void openWhatsAppCheckout()}
          >
            {applying
              ? "Updating stock…"
              : detailsComplete
                ? `Open WhatsApp — ${totalItems} item${totalItems === 1 ? "" : "s"}`
                : "Enter name, phone & location — tap to scroll"}
          </button>
        </div>
      </div>

      <div className="h-20 lg:hidden" aria-hidden />
    </>
  );
}
