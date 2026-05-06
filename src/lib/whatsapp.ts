/** Normalize stored setting to wa.me path segment (digits only). */
export function normalizeWhatsAppNumber(raw: string): string {
  return raw.replace(/\D/g, "");
}

export function buildWhatsAppOrderUrl(phoneDigits: string, message: string): string {
  const num = normalizeWhatsAppNumber(phoneDigits);
  const text = encodeURIComponent(message);
  return `https://wa.me/${num}?text=${text}`;
}
