import { currentUser } from "@clerk/nextjs/server";
import { getWhatsAppNumberPublic } from "@/lib/catalog";
import { CartClient } from "./cart-client";

export default async function CartPage() {
  let whatsapp = "";
  try {
    whatsapp = await getWhatsAppNumberPublic();
  } catch {
    whatsapp = "";
  }

  const user = await currentUser();
  const initialClientName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ").trim()
    : "";

  return (
    <div className="mx-auto max-w-6xl px-3 py-6 sm:px-6 sm:py-10">
      <h1 className="font-display text-2xl font-semibold text-[var(--foreground)] sm:text-3xl">
        Your cart
      </h1>
      <p className="mt-2 text-sm text-[var(--foreground-muted)] sm:text-base">
        Add your name, phone, and location — they&apos;re sent with your items and prices on
        WhatsApp. We&apos;ll confirm your total in Kenya Shillings there.
      </p>
      <div className="mt-6 sm:mt-8">
        <CartClient whatsappNumber={whatsapp} initialClientName={initialClientName} />
      </div>
    </div>
  );
}
