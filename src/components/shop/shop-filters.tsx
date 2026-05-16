import Link from "next/link";

type Props = {
  action: string;
  q: string;
  availability: string;
  clearHref: string;
  showClear: boolean;
  searchPlaceholder?: string;
};

export function ShopFilters({
  action,
  q,
  availability,
  clearHref,
  showClear,
  searchPlaceholder = "Search products…",
}: Props) {
  return (
    <div className="space-y-2">
      <form
        action={action}
        method="get"
        className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2"
      >
        <input
          name="q"
          defaultValue={q}
          placeholder={searchPlaceholder}
          className="ui-input mt-0 min-w-0 flex-1 border-0 bg-transparent py-2 text-sm shadow-none focus:ring-0"
        />
        <select
          name="availability"
          defaultValue={availability}
          className="ui-select mt-0 w-auto shrink-0 border-0 bg-transparent py-2 text-xs shadow-none"
          aria-label="Availability"
        >
          <option value="all">All</option>
          <option value="in-stock">In stock</option>
          <option value="sold-out">Sold out</option>
        </select>
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-[var(--gold)] px-3 py-2 text-xs font-semibold text-[var(--on-gold)] transition hover:bg-[var(--gold-hover)]"
        >
          Filter
        </button>
      </form>
      {showClear ? (
        <Link href={clearHref} className="text-xs font-medium text-[var(--gold)] hover:underline">
          Clear filters
        </Link>
      ) : null}
    </div>
  );
}
