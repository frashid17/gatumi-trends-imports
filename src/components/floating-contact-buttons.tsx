import { getFloatingContactNumbersPublic } from "@/lib/catalog";
import { normalizeWhatsAppNumber } from "@/lib/whatsapp";

function normalizeCallNumber(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("+")) return `+${trimmed.slice(1).replace(/\D/g, "")}`;
  return trimmed.replace(/\D/g, "");
}

export async function FloatingContactButtons() {
  let whatsappRaw = "";
  let callRaw = "";
  try {
    const contacts = await getFloatingContactNumbersPublic();
    whatsappRaw = contacts.whatsappNumber;
    callRaw = contacts.callNumber;
  } catch {
    whatsappRaw = "";
    callRaw = "";
  }

  const whatsapp = normalizeWhatsAppNumber(whatsappRaw);
  const callNumber = normalizeCallNumber(callRaw);
  if (!whatsapp && !callNumber) return null;

  return (
    <div className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] left-3 z-40 flex flex-row gap-2 md:bottom-6 md:right-6 md:left-auto md:flex-col">
      {callNumber ? (
        <a
          href={`tel:${callNumber}`}
          aria-label="Call us"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-solid)] text-[var(--foreground)] shadow-lg transition hover:border-[var(--gold)]/45 hover:bg-[var(--nav-hover)] sm:h-12 sm:w-12"
          title="Call us"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.86 19.86 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.62a2 2 0 0 1-.45 2.11L8 9.91a16 16 0 0 0 6.09 6.09l1.46-1.28a2 2 0 0 1 2.11-.45c.84.29 1.72.5 2.62.62A2 2 0 0 1 22 16.92z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      ) : null}
      {whatsapp ? (
        <a
          href={`https://wa.me/${whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:opacity-95 sm:h-12 sm:w-12"
          title="Chat on WhatsApp"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M20.52 3.48A11.8 11.8 0 0 0 12.12 0C5.48 0 .08 5.4.08 12.04c0 2.12.56 4.2 1.62 6.03L0 24l6.08-1.67a12.02 12.02 0 0 0 6.04 1.64h.01c6.63 0 12.03-5.4 12.03-12.04 0-3.22-1.25-6.25-3.64-8.45zM12.13 21.9h-.01a9.86 9.86 0 0 1-5.03-1.38l-.36-.21-3.61 1 1-3.52-.24-.37a9.88 9.88 0 0 1-1.52-5.28c0-5.45 4.43-9.89 9.88-9.89 2.64 0 5.12 1.03 6.98 2.9a9.8 9.8 0 0 1 2.89 6.97c0 5.45-4.43 9.88-9.88 9.88zm5.42-7.4c-.3-.15-1.77-.87-2.05-.97-.27-.1-.47-.15-.67.15s-.77.97-.95 1.16c-.17.2-.35.22-.65.08-.3-.15-1.28-.47-2.43-1.5-.9-.8-1.5-1.8-1.67-2.1-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.48-.5-.67-.5h-.57c-.2 0-.52.08-.8.37-.27.3-1.05 1.02-1.05 2.5 0 1.47 1.07 2.9 1.22 3.1.15.2 2.1 3.2 5.08 4.48.71.31 1.26.5 1.7.64.71.22 1.36.19 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.08-.13-.27-.2-.57-.35z" />
          </svg>
        </a>
      ) : null}
    </div>
  );
}
