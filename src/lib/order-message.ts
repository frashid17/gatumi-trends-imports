import { CURRENCY_CODE } from "@/lib/site";

export type OrderMessageLine = {
  name: string;
  qty: number;
  price_hint: string | null;
  size: string | null;
  color: string | null;
  /** When set with `siteOrigin`, a product page link is appended for this line. */
  productId?: string | null;
};

export function buildWhatsAppOrderMessage(params: {
  clientName: string;
  clientPhone: string;
  clientLocation: string;
  note: string;
  lines: OrderMessageLine[];
  email?: string | null;
  /** Public site origin (no trailing slash); used with each line’s `productId` for product links. */
  siteOrigin?: string | null;
}): string {
  const { clientName, clientPhone, clientLocation, note, lines, email, siteOrigin } = params;
  const origin = (siteOrigin ?? "").trim().replace(/\/+$/, "");

  const header = `Order — Gatumi's Trends Imports`;

  const customerBlock = [
    `*Customer details*`,
    `Name: ${clientName.trim()}`,
    `Phone: ${clientPhone.trim()}`,
    `Location: ${clientLocation.trim()}`,
    email?.trim() ? `Email: ${email.trim()}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const itemsBlock = [
    `*Items*`,
    ...lines.map((l, i) => {
      const pricePart = l.price_hint?.trim()
        ? `${l.price_hint.trim()} (${CURRENCY_CODE})`
        : `To be confirmed (${CURRENCY_CODE})`;
      const qtyPart = l.qty > 1 ? ` × ${l.qty}` : "";
      const variant = [l.size, l.color].filter(Boolean).join(" / ");
      const pid = l.productId?.trim();
      const linkPart =
        origin && pid ? `\n   Product link: ${origin}/product/${pid}` : "";
      return `${i + 1}) ${l.name}${variant ? ` (${variant})` : ""}${qtyPart}\n   Price: ${pricePart}${linkPart}`;
    }),
  ].join("\n");

  const noteBlock = note.trim() ? `\n\n*Note*\n${note.trim()}` : "";

  const tail = `\n\nPlease confirm availability and final total in ${CURRENCY_CODE}. Thank you!`;

  return `${header}\n\n${customerBlock}\n\n${itemsBlock}${noteBlock}${tail}`;
}
