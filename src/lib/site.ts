/** Canonical public origin for links in WhatsApp order messages (product pages). */
const DEFAULT_PUBLIC_SITE_ORIGIN = "https://gatumitrendsimports.co.ke";

/**
 * Base URL for product links in prefilled WhatsApp text (no trailing slash).
 * Prefer `NEXT_PUBLIC_SITE_URL` in production; otherwise the current browser origin on the client;
 * otherwise the live shop URL so server-rendered previews still include a working link.
 */
export function getPublicSiteOriginForOrderLinks(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "") ?? "";
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined" && window.location?.origin) return window.location.origin;
  return DEFAULT_PUBLIC_SITE_ORIGIN;
}

/** Store locale — prices quoted in Kenya Shillings */
export const CURRENCY_CODE = "KES";
export const CURRENCY_NAME = "Kenya Shillings";

export const priceHintLabel = `Price (${CURRENCY_CODE})`;
export const priceOnRequestShort = `KES price on WhatsApp`;
export const priceConfirmedWhatsApp = `Final price in ${CURRENCY_CODE} confirmed on WhatsApp`;
