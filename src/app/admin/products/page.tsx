import Link from "next/link";
import { getAllProducts, getCategories } from "@/lib/catalog";
import { deleteProduct, toggleProductSoldOut } from "@/app/admin/actions";
import { CURRENCY_CODE } from "@/lib/site";

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([getAllProducts(), getCategories()]);
  const catMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));
  const soldOutCount = products.filter((p) => p.sold_out).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-[var(--foreground)] sm:text-3xl">
            Products
          </h2>
          <p className="mt-1 text-sm text-[var(--foreground-muted)]">
            Price hints are shown to customers in {CURRENCY_CODE}. Toggle sold out, edit, or
            remove.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-[var(--border)] bg-[var(--surface-elevated)]/50 px-3 py-1 text-[var(--foreground-muted)]">
              Total: <strong className="text-[var(--foreground)]">{products.length}</strong>
            </span>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-emerald-200">
              In stock: {products.length - soldOutCount}
            </span>
            <span className="rounded-full border border-amber-500/30 bg-amber-500/15 px-3 py-1 text-amber-200">
              Sold out: {soldOutCount}
            </span>
          </div>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--gold)] px-4 py-2.5 text-sm font-semibold text-[var(--on-gold)] transition hover:bg-[var(--gold-hover)] active:scale-[0.98] sm:min-h-0"
        >
          Add product
        </Link>
      </div>

      <div className="space-y-3 md:hidden">
        {products.map((p) => (
          <div
            key={p.id}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 backdrop-blur-sm"
          >
            <p className="font-medium text-[var(--foreground)]">{p.name}</p>
            {p.price_hint ? (
              <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                {p.price_hint} ({CURRENCY_CODE})
              </p>
            ) : null}
            <p className="mt-2 text-xs text-[var(--foreground-muted)]">
              {p.category_id ? catMap[p.category_id] ?? "—" : "—"}
            </p>
            <p className="mt-1 text-xs text-[var(--foreground-muted)]">
              Stock:{" "}
              <span className="font-medium text-[var(--foreground)]">
                {p.stock_quantity == null ? "Unlimited" : p.stock_quantity}
              </span>
            </p>
            <form action={toggleProductSoldOut.bind(null, p.id, !p.sold_out)} className="mt-3">
              <button
                type="submit"
                className={`min-h-10 w-full rounded-lg px-3 py-2 text-sm font-medium ${
                  p.sold_out
                    ? "bg-amber-500/20 text-amber-200"
                    : "bg-emerald-500/20 text-emerald-200"
                }`}
              >
                {p.sold_out ? "Marked sold out — tap to mark in stock" : "In stock — tap to mark sold out"}
              </button>
            </form>
            <div className="mt-3 flex gap-3">
              <Link
                href={`/admin/products/${p.id}`}
                className="inline-flex min-h-10 flex-1 items-center justify-center rounded-lg border border-[var(--border)] text-sm font-medium text-[var(--gold)]"
              >
                Edit
              </Link>
              <form action={deleteProduct.bind(null, p.id)} className="flex-1">
                <button
                  type="submit"
                  className="min-h-10 w-full rounded-lg border border-red-500/30 text-sm font-medium text-red-400"
                >
                  Delete
                </button>
              </form>
            </div>
          </div>
        ))}
        {products.length === 0 ? (
          <p className="p-6 text-center text-[var(--foreground-muted)]">No products yet.</p>
        ) : null}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-lg shadow-black/10 backdrop-blur-sm md:block">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[var(--border)] bg-[var(--surface-elevated)]">
            <tr>
              <th className="px-4 py-3 font-medium text-[var(--foreground)]">Name</th>
              <th className="px-4 py-3 font-medium text-[var(--foreground)]">Category</th>
              <th className="px-4 py-3 font-medium text-[var(--foreground)]">Stock</th>
              <th className="px-4 py-3 font-medium text-[var(--foreground)]">Sold out</th>
              <th className="px-4 py-3 font-medium text-[var(--foreground)]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {products.map((p) => (
              <tr key={p.id} className="transition-colors hover:bg-[var(--surface-elevated)]/35">
                <td className="px-4 py-3">
                  <span className="font-medium text-[var(--foreground)]">{p.name}</span>
                  {p.price_hint ? (
                    <p className="text-xs text-[var(--foreground-muted)]">
                      {p.price_hint} ({CURRENCY_CODE})
                    </p>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-[var(--foreground-muted)]">
                  {p.category_id ? catMap[p.category_id] ?? "—" : "—"}
                </td>
                <td className="px-4 py-3 text-[var(--foreground-muted)]">
                  {p.stock_quantity == null ? "Unlimited" : p.stock_quantity}
                </td>
                <td className="px-4 py-3">
                  <form action={toggleProductSoldOut.bind(null, p.id, !p.sold_out)}>
                    <button
                      type="submit"
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                        p.sold_out
                          ? "bg-amber-500/20 text-amber-200"
                          : "bg-emerald-500/20 text-emerald-200"
                      }`}
                    >
                      {p.sold_out ? "Sold out" : "In stock"}
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="font-medium text-[var(--gold)] hover:underline"
                    >
                      Edit
                    </Link>
                    <form action={deleteProduct.bind(null, p.id)} className="inline">
                      <button
                        type="submit"
                        className="font-medium text-red-400 hover:text-red-300 hover:underline"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 ? (
          <p className="p-8 text-center text-[var(--foreground-muted)]">No products yet.</p>
        ) : null}
      </div>
    </div>
  );
}
