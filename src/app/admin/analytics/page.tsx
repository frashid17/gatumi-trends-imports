import { getAllProducts, getAllVariants, getCategories } from "@/lib/catalog";

export default async function AdminAnalyticsPage() {
  const [products, categories, variants] = await Promise.all([
    getAllProducts(),
    getCategories(),
    getAllVariants(),
  ]);

  const soldOutProducts = products.filter((p) => p.sold_out).length;
  const trackedProducts = products.filter((p) => p.stock_quantity != null).length;
  const lowStockProducts = products.filter(
    (p) => p.stock_quantity != null && p.stock_quantity > 0 && p.stock_quantity <= 3,
  ).length;
  const soldOutVariants = variants.filter((v) => v.sold_out).length;
  const trackedVariants = variants.filter((v) => v.stock_quantity != null).length;

  const categoryCountMap = new Map<string, number>();
  for (const p of products) {
    if (!p.category_id) continue;
    categoryCountMap.set(p.category_id, (categoryCountMap.get(p.category_id) ?? 0) + 1);
  }
  const topCategories = [...categoryCountMap.entries()]
    .map(([id, count]) => ({
      id,
      count,
      name: categories.find((c) => c.id === id)?.name ?? "Unknown",
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-semibold text-[var(--foreground)] sm:text-3xl">
          Analytics
        </h2>
        <p className="mt-2 text-sm text-[var(--foreground-muted)]">
          Quick operational metrics from your current catalog and variant inventory.
        </p>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total products" value={products.length} />
        <MetricCard label="Sold-out products" value={soldOutProducts} accent="amber" />
        <MetricCard label="Tracked product stock" value={trackedProducts} accent="emerald" />
        <MetricCard label="Low-stock products (<=3)" value={lowStockProducts} accent="amber" />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 backdrop-blur-sm sm:p-6">
          <h3 className="font-display text-lg font-semibold text-[var(--foreground)]">
            Variants snapshot
          </h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <MetricCard label="Total variants" value={variants.length} compact />
            <MetricCard label="Tracked variants" value={trackedVariants} compact accent="emerald" />
            <MetricCard label="Sold-out variants" value={soldOutVariants} compact accent="amber" />
            <MetricCard
              label="Products using variants"
              value={new Set(variants.map((v) => v.product_id)).size}
              compact
            />
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 backdrop-blur-sm sm:p-6">
          <h3 className="font-display text-lg font-semibold text-[var(--foreground)]">
            Top categories
          </h3>
          {topCategories.length === 0 ? (
            <p className="mt-4 text-sm text-[var(--foreground-muted)]">No category data yet.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {topCategories.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)]/35 px-3 py-2 text-sm"
                >
                  <span className="text-[var(--foreground)]">{c.name}</span>
                  <span className="font-semibold text-[var(--gold)]">{c.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  accent = "default",
  compact = false,
}: {
  label: string;
  value: number;
  accent?: "default" | "amber" | "emerald";
  compact?: boolean;
}) {
  const accentClass =
    accent === "amber"
      ? "text-amber-200"
      : accent === "emerald"
        ? "text-emerald-200"
        : "text-[var(--foreground)]";
  return (
    <div
      className={`rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)]/35 ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <p className="text-xs uppercase tracking-wider text-[var(--foreground-muted)]">{label}</p>
      <p className={`mt-2 font-display ${compact ? "text-xl" : "text-3xl"} font-semibold ${accentClass}`}>
        {value}
      </p>
    </div>
  );
}
