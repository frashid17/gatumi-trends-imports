import Link from "next/link";
import { getAllProducts, getCategories } from "@/lib/catalog";

export default async function AdminDashboardPage() {
  const [products, categories] = await Promise.all([getAllProducts(), getCategories()]);
  const soldOutCount = products.filter((p) => p.sold_out).length;
  const inStockCount = products.length - soldOutCount;

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 backdrop-blur-sm sm:p-8">
        <h2 className="font-display text-2xl font-semibold text-[var(--foreground)] sm:text-3xl">
          Dashboard
        </h2>
        <p className="mt-2 text-[var(--foreground-muted)]">
          Manage products, categories, sold-out status, and your WhatsApp order channel.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)]/45 p-4">
            <p className="text-xs uppercase tracking-wider text-[var(--foreground-muted)]">Products</p>
            <p className="mt-2 font-display text-2xl font-semibold text-[var(--foreground)]">
              {products.length}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)]/45 p-4">
            <p className="text-xs uppercase tracking-wider text-[var(--foreground-muted)]">In stock</p>
            <p className="mt-2 font-display text-2xl font-semibold text-emerald-200">{inStockCount}</p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)]/45 p-4">
            <p className="text-xs uppercase tracking-wider text-[var(--foreground-muted)]">Sold out</p>
            <p className="mt-2 font-display text-2xl font-semibold text-amber-200">{soldOutCount}</p>
          </div>
        </div>
      </section>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <li>
          <Link
            href="/admin/analytics"
            className="block rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 backdrop-blur-sm transition hover:border-[var(--gold)]/30 hover:shadow-lg hover:shadow-black/20"
          >
            <h3 className="font-display text-lg font-semibold text-[var(--foreground)]">Analytics</h3>
            <p className="mt-1 text-sm text-[var(--foreground-muted)]">
              Stock health, sold-out counts, and category insights
            </p>
            <p className="mt-4 text-sm font-medium text-[var(--gold)]">Open analytics →</p>
          </Link>
        </li>
        <li>
          <Link
            href="/admin/products"
            className="block rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 backdrop-blur-sm transition hover:border-[var(--gold)]/30 hover:shadow-lg hover:shadow-black/20"
          >
            <h3 className="font-display text-lg font-semibold text-[var(--foreground)]">Products</h3>
            <p className="mt-1 text-sm text-[var(--foreground-muted)]">
              Add, edit, delete, mark sold out
            </p>
            <p className="mt-4 text-sm font-medium text-[var(--gold)]">Open products →</p>
          </Link>
        </li>
        <li>
          <Link
            href="/admin/categories"
            className="block rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 backdrop-blur-sm transition hover:border-[var(--gold)]/30 hover:shadow-lg hover:shadow-black/20"
          >
            <h3 className="font-display text-lg font-semibold text-[var(--foreground)]">Categories</h3>
            <p className="mt-1 text-sm text-[var(--foreground-muted)]">Create or remove categories</p>
            <p className="mt-2 text-xs text-[var(--foreground-muted)]">{categories.length} total</p>
            <p className="mt-4 text-sm font-medium text-[var(--gold)]">Open categories →</p>
          </Link>
        </li>
        <li>
          <Link
            href="/admin/users"
            className="block rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 backdrop-blur-sm transition hover:border-[var(--gold)]/30 hover:shadow-lg hover:shadow-black/20"
          >
            <h3 className="font-display text-lg font-semibold text-[var(--foreground)]">Users</h3>
            <p className="mt-1 text-sm text-[var(--foreground-muted)]">
              View all signups and grant/revoke admin role
            </p>
            <p className="mt-4 text-sm font-medium text-[var(--gold)]">Open users →</p>
          </Link>
        </li>
        <li>
          <Link
            href="/admin/settings"
            className="block rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 backdrop-blur-sm transition hover:border-[var(--gold)]/30 hover:shadow-lg hover:shadow-black/20"
          >
            <h3 className="font-display text-lg font-semibold text-[var(--foreground)]">Settings</h3>
            <p className="mt-1 text-sm text-[var(--foreground-muted)]">
              Number used when customers send orders
            </p>
            <p className="mt-4 text-sm font-medium text-[var(--gold)]">Open settings →</p>
          </Link>
        </li>
      </ul>
    </div>
  );
}
