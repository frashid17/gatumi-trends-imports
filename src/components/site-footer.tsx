import Link from "next/link";

const footerLinks = [
  { href: "/products", label: "All products" },
  { href: "/shop", label: "Categories" },
  { href: "/cart", label: "Cart" },
] as const;

export function SiteFooter() {
  return (
    <footer className="relative mt-auto border-t border-[var(--border)] bg-[var(--surface-solid)]/90 pb-[max(2rem,env(safe-area-inset-bottom))] pt-10 text-[var(--foreground-muted)] backdrop-blur-xl sm:pt-14">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--gold)]/35 to-transparent"
        aria-hidden
      />
      <div className="mx-auto max-w-6xl px-3 sm:px-6">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between sm:gap-12">
          <div className="max-w-md">
            <p className="font-display text-lg font-semibold tracking-tight text-[var(--foreground)]">
              <span className="text-[var(--gold)]">Gatumi&apos;s</span> Trends Imports
            </p>
            <p className="mt-3 text-sm leading-relaxed">
              Curated imports with personal service. Browse on your phone, build your cart, then reach us on
              WhatsApp — we&apos;ll confirm your order in Kenya Shillings.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--gold)]">Shop</p>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm">
              {footerLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-[var(--foreground-muted)] transition-colors hover:text-[var(--foreground)]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center gap-3 border-t border-[var(--border)] pt-8 sm:flex-row sm:justify-between sm:pt-10">
          <p className="text-center text-xs sm:text-left sm:text-sm">
            © {new Date().getFullYear()} Gatumi&apos;s Trends Imports · Prices in{" "}
            <span className="font-medium text-[var(--foreground)]">KES</span>
          </p>
          <p className="text-center text-[11px] text-[var(--foreground-muted)]/90 sm:text-right sm:text-xs">
            Quality imports · Trend-forward picks
          </p>
        </div>
      </div>
    </footer>
  );
}
