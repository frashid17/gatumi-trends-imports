import type { ReactNode } from "react";

/** Always three columns — mobile and desktop (WeiGou-style catalog grid). */
export function ProductGrid({ children }: { children: ReactNode }) {
  return (
    <ul className="grid grid-cols-3 gap-1.5 sm:gap-2 md:gap-2.5">{children}</ul>
  );
}
