"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";
import { useCart } from "@/components/cart/cart-context";
import { useWishlist } from "@/components/wishlist/wishlist-context";
import { ThemeToggle } from "@/components/theme-toggle";

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      {open ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      )}
    </svg>
  );
}

export function AppHeader({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const { totalItems } = useCart();
  const { count: wishCount } = useWishlist();
  const [menuOpen, setMenuOpen] = useState(false);
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const desktopNavLinkClass =
    "inline-flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-full px-3 text-sm font-medium text-[var(--foreground-muted)] transition-colors hover:bg-[var(--nav-hover)] hover:text-[var(--foreground)]";

  const drawerLinkClass =
    "flex items-center gap-3 rounded-xl px-4 py-3.5 text-[15px] font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--nav-hover)] active:bg-[var(--nav-hover)]";

  return (
    <header className="relative sticky top-0 z-50 border-b border-[var(--border)] bg-gradient-to-b from-[var(--surface-solid)]/95 to-[var(--surface-solid)]/88 shadow-[var(--header-shadow)] backdrop-blur-xl supports-[backdrop-filter]:bg-[var(--surface-solid)]/80">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--gold)]/45 to-transparent"
        aria-hidden
      />

      <div className="relative mx-auto flex max-w-6xl min-w-0 items-center justify-between gap-3 px-3 py-2.5 md:h-[4.25rem] md:gap-4 md:px-6 md:py-0">
        <Link
          href="/"
          className="group flex min-h-10 min-w-0 shrink items-center gap-2 md:min-h-11 md:gap-3"
        >
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--gold)]/25 bg-[var(--gold)]/10 text-[var(--gold)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition group-hover:border-[var(--gold)]/40 group-hover:bg-[var(--gold)]/15"
            aria-hidden
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </span>
          <span className="min-w-0 text-left">
            <span className="font-display block text-[15px] font-semibold leading-tight tracking-tight text-[var(--foreground)] md:text-lg lg:text-xl">
              <span className="text-[var(--gold)]">Gatumi&apos;s</span>{" "}
              <span className="text-[var(--foreground)]">Trends</span>
            </span>
            <span className="mt-0.5 block font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--foreground-muted)] md:text-[11px]">
              Imports
            </span>
          </span>
        </Link>

        {/* Desktop / tablet — inline navigation */}
        <nav className="hidden min-w-0 flex-1 items-center justify-end gap-2 md:flex md:pl-2">
          <div className="flex flex-nowrap items-stretch gap-0.5 rounded-full border border-[var(--border)] bg-[var(--surface)]/50 p-1 backdrop-blur-sm">
            <Link href="/products" className={desktopNavLinkClass}>
              Products
            </Link>
            <Link href="/shop" className={desktopNavLinkClass}>
              Categories
            </Link>
            <Link href="/wishlist" className={`${desktopNavLinkClass} gap-1.5`}>
              Wishlist
              {wishCount > 0 ? (
                <span className="rounded-full bg-[var(--gold)]/25 px-2 py-0.5 text-xs font-semibold text-[var(--gold)] tabular-nums">
                  {wishCount}
                </span>
              ) : null}
            </Link>
            <Link href="/cart" className={`${desktopNavLinkClass} gap-1.5`}>
              Cart
              {totalItems > 0 ? (
                <span className="rounded-full bg-[var(--gold)] px-2 py-0.5 text-xs font-semibold text-[var(--on-gold)] tabular-nums shadow-sm">
                  {totalItems}
                </span>
              ) : null}
            </Link>
          </div>

          <div className="flex flex-nowrap items-center gap-2 pl-1">
            <ThemeToggle />
            {isAdmin ? (
              <Link
                href="/admin"
                className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-[var(--gold)]/45 bg-[var(--gold)]/12 px-3.5 text-sm font-semibold text-[var(--gold)] shadow-sm transition hover:bg-[var(--gold)]/22"
              >
                Admin
              </Link>
            ) : null}
            {!isSignedIn ? (
              <div className="flex items-center gap-1 lg:gap-2">
                <SignInButton mode="modal">
                  <button
                    type="button"
                    className="min-h-11 rounded-lg px-3 text-sm font-medium text-[var(--foreground-muted)] transition-colors hover:text-[var(--foreground)]"
                  >
                    Log in
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button
                    type="button"
                    className="min-h-11 shrink-0 rounded-full border border-[var(--border)] bg-[var(--surface-elevated)]/40 px-3.5 text-sm font-medium text-[var(--foreground)] shadow-sm transition hover:border-[var(--gold)]/45 hover:bg-[var(--nav-hover)]"
                  >
                    Sign up
                  </button>
                </SignUpButton>
              </div>
            ) : (
              <div className="flex min-h-11 shrink-0 items-center">
                <UserButton />
              </div>
            )}
          </div>
        </nav>

        {/* Mobile — Yamale-style compact bar */}
        <div className="flex shrink-0 items-center gap-1 md:hidden">
          <ThemeToggle />
          {isSignedIn ? (
            <div className="flex min-h-10 items-center">
              <UserButton />
            </div>
          ) : null}
          <button
            type="button"
            className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)]/50 text-[var(--foreground)] transition hover:border-[var(--gold)]/40 hover:bg-[var(--nav-hover)]"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-drawer"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <HamburgerIcon open={menuOpen} />
          </button>
        </div>
      </div>

      {/* Portal: backdrop-filter on <header> traps fixed descendants — render drawer on document.body */}
      {portalReady && menuOpen
        ? createPortal(
            <>
              <button
                type="button"
                className="fixed inset-0 z-[100] bg-black/55 backdrop-blur-[2px] md:hidden"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
              />
              <aside
                id="mobile-nav-drawer"
                role="dialog"
                aria-modal="true"
                aria-labelledby="mobile-nav-drawer-title"
                className="fixed inset-y-0 right-0 z-[110] flex h-[100dvh] max-h-[100dvh] w-[min(22rem,calc(100vw-2rem))] min-h-0 flex-col border-l border-[var(--border)] bg-[var(--surface-solid)] shadow-[-12px_0_40px_rgba(0,0,0,0.35)] md:hidden"
              >
                <div className="flex shrink-0 items-center justify-between border-b border-[var(--border)] px-4 py-4">
                  <p
                    id="mobile-nav-drawer-title"
                    className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--foreground)]"
                  >
                    Menu
                  </p>
                  <button
                    type="button"
                    className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--foreground-muted)] transition hover:bg-[var(--nav-hover)] hover:text-[var(--foreground)]"
                    aria-label="Close menu"
                    onClick={() => setMenuOpen(false)}
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                  <ul className="space-y-1">
                    <li>
                      <Link href="/products" className={drawerLinkClass} onClick={() => setMenuOpen(false)}>
                        Products
                      </Link>
                    </li>
                    <li>
                      <Link href="/shop" className={drawerLinkClass} onClick={() => setMenuOpen(false)}>
                        Categories
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/wishlist"
                        className={`${drawerLinkClass} justify-between gap-4`}
                        onClick={() => setMenuOpen(false)}
                      >
                        <span>Wishlist</span>
                        {wishCount > 0 ? (
                          <span className="rounded-full bg-[var(--gold)]/25 px-2 py-0.5 text-xs font-semibold text-[var(--gold)] tabular-nums">
                            {wishCount}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/cart"
                        className={`${drawerLinkClass} justify-between gap-4`}
                        onClick={() => setMenuOpen(false)}
                      >
                        <span>Cart</span>
                        {totalItems > 0 ? (
                          <span className="rounded-full bg-[var(--gold)] px-2 py-0.5 text-xs font-semibold text-[var(--on-gold)] tabular-nums">
                            {totalItems}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  </ul>

                  {isAdmin ? (
                    <div className="mt-6 border-t border-[var(--border)] pt-4">
                      <Link
                        href="/admin"
                        className={`${drawerLinkClass} border border-[var(--gold)]/35 bg-[var(--gold)]/10 text-[var(--gold)]`}
                        onClick={() => setMenuOpen(false)}
                      >
                        Admin
                      </Link>
                    </div>
                  ) : null}

                  {!isSignedIn ? (
                    <div className="mt-8 space-y-3 border-t border-[var(--border)] pt-6">
                      <SignInButton mode="modal">
                        <button
                          type="button"
                          className="flex min-h-12 w-full items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)]/40 px-4 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--nav-hover)]"
                          onClick={() => setMenuOpen(false)}
                        >
                          Log in
                        </button>
                      </SignInButton>
                      <SignUpButton mode="modal">
                        <button
                          type="button"
                          className="flex min-h-12 w-full items-center justify-center rounded-xl bg-[var(--gold)] px-4 text-sm font-semibold text-[var(--on-gold)] transition hover:bg-[var(--gold-hover)]"
                          onClick={() => setMenuOpen(false)}
                        >
                          Sign up
                        </button>
                      </SignUpButton>
                    </div>
                  ) : null}
                </nav>
              </aside>
            </>,
            document.body,
          )
        : null}
    </header>
  );
}
