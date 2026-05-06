import { getCategories } from "@/lib/catalog";
import { createCategory, deleteCategory } from "@/app/admin/actions";

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-semibold text-[var(--foreground)] sm:text-3xl">
          Categories
        </h2>
        <p className="mt-2 text-sm text-[var(--foreground-muted)]">
          Default categories are seeded in Supabase. Add more or remove unused ones (products in a
          deleted category lose their category link).
        </p>
      </div>
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-xs text-[var(--foreground-muted)] sm:p-5">
        Total categories: <strong className="text-[var(--foreground)]">{categories.length}</strong>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 backdrop-blur-sm sm:p-6">
          <h3 className="font-display text-lg font-semibold text-[var(--foreground)]">Add category</h3>
          <form action={createCategory} className="mt-4 space-y-3">
            <label className="block text-sm">
              <span className="text-[var(--foreground-muted)]">Name</span>
              <input
                name="name"
                required
                className="ui-input"
                placeholder="e.g. Accessories"
              />
            </label>
            <label className="block text-sm">
              <span className="text-[var(--foreground-muted)]">Slug (optional)</span>
              <input
                name="slug"
                className="ui-input"
                placeholder="auto from name if empty"
              />
            </label>
            <button
              type="submit"
              className="rounded-xl bg-[var(--gold)] px-5 py-2.5 text-sm font-semibold text-[var(--on-gold)] transition hover:bg-[var(--gold-hover)]"
            >
              Create
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 backdrop-blur-sm sm:p-6">
          <h3 className="font-display text-lg font-semibold text-[var(--foreground)]">Existing</h3>
          <ul className="mt-4 divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)]/25">
            {categories.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-[var(--foreground)]">{c.name}</p>
                  <p className="text-[var(--foreground-muted)]">/{c.slug}</p>
                </div>
                <form action={deleteCategory.bind(null, c.id)}>
                  <button
                    type="submit"
                    className="font-medium text-red-400 hover:text-red-300 hover:underline"
                    title="Delete category"
                  >
                    Delete
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
