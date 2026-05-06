import { getWhatsAppNumberAdmin } from "@/lib/catalog";
import { updateWhatsAppNumber } from "@/app/admin/actions";

export default async function AdminSettingsPage() {
  let current = "";
  try {
    current = await getWhatsAppNumberAdmin();
  } catch {
    current = "";
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
        <h3 className="font-display text-lg font-semibold text-[var(--foreground)]">WhatsApp number</h3>
        <p className="mt-2 text-sm text-[var(--foreground-muted)]">
          Use your full international number (country code + number, with or without +). Example:
          +234 801 234 5678
        </p>
        <form action={updateWhatsAppNumber} className="mt-6 space-y-4">
          <label className="block text-sm">
            <span className="text-[var(--foreground-muted)]">WhatsApp</span>
            <input
              name="whatsapp_number"
              type="text"
              defaultValue={current}
              required
              className="ui-input"
              placeholder="+2348012345678"
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
