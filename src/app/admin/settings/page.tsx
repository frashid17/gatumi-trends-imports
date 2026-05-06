import { getFloatingContactNumbersAdmin, getWhatsAppNumberAdmin } from "@/lib/catalog";
import { updateContactNumbers } from "@/app/admin/actions";

export default async function AdminSettingsPage() {
  let current = "";
  let floatingWhatsapp = "";
  let floatingCall = "";
  try {
    const [orderWhatsapp, floating] = await Promise.all([
      getWhatsAppNumberAdmin(),
      getFloatingContactNumbersAdmin(),
    ]);
    current = orderWhatsapp;
    floatingWhatsapp = floating.whatsappNumber;
    floatingCall = floating.callNumber;
  } catch {
    current = "";
    floatingWhatsapp = "";
    floatingCall = "";
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-[var(--foreground)] sm:text-3xl">
          Settings
        </h2>
        <p className="mt-2 text-sm text-[var(--foreground-muted)]">
          Update the WhatsApp number customers use when opening their cart order.
        </p>
      </div>
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 backdrop-blur-sm sm:p-6">
        <h3 className="font-display text-lg font-semibold text-[var(--foreground)]">Contact numbers</h3>
        <p className="mt-2 text-sm text-[var(--foreground-muted)]">
          Use full international numbers (country code + number, with or without +). These values
          control checkout WhatsApp and floating contact buttons.
        </p>
        <form action={updateContactNumbers} className="mt-6 space-y-4">
          <label className="block text-sm">
            <span className="text-[var(--foreground-muted)]">Order WhatsApp (cart/checkout)</span>
            <input
              name="whatsapp_number"
              type="text"
              defaultValue={current}
              required
              className="ui-input"
              placeholder="+254712345678"
            />
          </label>
          <label className="block text-sm">
            <span className="text-[var(--foreground-muted)]">Floating WhatsApp (optional)</span>
            <input
              name="floating_whatsapp_number"
              type="text"
              defaultValue={floatingWhatsapp}
              className="ui-input"
              placeholder="+254712345678"
            />
          </label>
          <label className="block text-sm">
            <span className="text-[var(--foreground-muted)]">Floating Call number (optional)</span>
            <input
              name="floating_call_number"
              type="text"
              defaultValue={floatingCall}
              className="ui-input"
              placeholder="+254712345678"
            />
          </label>
          <button
            type="submit"
            className="rounded-xl bg-[var(--gold)] px-5 py-2.5 text-sm font-semibold text-[var(--on-gold)] transition hover:bg-[var(--gold-hover)]"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  );
}
