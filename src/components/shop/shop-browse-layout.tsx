import type { ReactNode } from "react";
import { CategoryTabs, type ShopCategory } from "@/components/shop/category-tabs";

type Props = {
  categories: ShopCategory[];
  activeSlug: string | null;
  title: string;
  count: number;
  filters?: ReactNode;
  children: ReactNode;
};

export function ShopBrowseLayout({
  categories,
  activeSlug,
  title,
  count,
  filters,
  children,
}: Props) {
  return (
    <div className="mx-auto max-w-6xl px-3 py-4 sm:px-6 sm:py-6">
      <div className="flex items-baseline justify-between gap-3">
        <h1 className="font-display text-lg font-semibold text-[var(--foreground)] sm:text-2xl">
          {title}
        </h1>
        <p className="shrink-0 text-xs text-[var(--foreground-muted)] sm:text-sm">
          {count} item{count === 1 ? "" : "s"}
        </p>
      </div>

      <div className="mt-4">
        <CategoryTabs categories={categories} activeSlug={activeSlug} />
      </div>

      {filters ? <div className="mt-4">{filters}</div> : null}

      <div className="mt-4">{children}</div>
    </div>
  );
}
