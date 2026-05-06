"use client";

import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useCart } from "@/components/cart/cart-context";
import { useWishlist } from "@/components/wishlist/wishlist-context";
import { ThemeToggle } from "@/components/theme-toggle";

export function AppHeader({ isAdmin }: { isAdmin: boolean }) {
  const { isSignedIn } = useAuth();
  const { totalItems } = useCart();
  const { count: wishCount } = useWishlist();

  const navLinkClass =
    "flex min-h-[2.75rem] min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg px-1.5 py-1.5 text-center text-[10px] font-medium leading-tight text-[var(--foreground-muted)] transition-colors hover:bg-[var(--nav-hover)] hover:text-[var(--foreground)] sm:min-h-11 sm:flex-row sm:gap-1.5 sm:whitespace-nowrap sm:px-3 sm:py-2 sm:text-sm";

  return (
    <header className="relative sticky top-0 z-50 border-b border-[var(--border)] bg-gradient-to-b from-[var(--surface-solid)]/95 to-[var(--surface-solid)]/88 shadow-[var(--header-shadow)] backdrop-blur-xl supports-[backdrop-filter]:bg-[var(--surface-solid)]/80">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--gold)]/45 to-transparent"
        aria-hidden
      />
      <div className="relative mx-auto flex max-w-6xl min-w-0 flex-col gap-3 px-3 py-3 sm:h-[4.25rem] sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-0">
        <Link
          href="/"
          className="group flex min-h-11 shrink-0 items-center gap-2.5 sm:gap-3"
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
            <span className="font-display block text-base font-semibold leading-tight tracking-tight text-[var(--foreground)] sm:text-lg lg:text-xl">
              <span className="text-[var(--gold)]">Gatumi&apos;s</span>{" "}
              <span className="text-[var(--foreground)]">Trends</span>
            </span>
            <span className="mt-0.5 block font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--foreground-muted)] sm:text-[11px]">
              Imports
            </span>
          </span>
        </Link>

        <nav className="flex w-full min-w-0 min-h-11 flex-col items-stretch gap-2 sm:min-h-0 sm:w-auto sm:flex-row sm:items-center sm:gap-2 sm:pl-2">
          <div className="grid grid-cols-2 gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface)]/50 p-1 backdrop-blur-sm sm:flex sm:flex-nowrap sm:rounded-full">
            <Link href="/products" className={`${navLinkClass} rounded-md sm:rounded-full`}>
              <span className="max-w-full break-words sm:break-normal">Products</span>
            </Link>
            <Link href="/shop" className={`${navLinkClass} rounded-md sm:rounded-full`}>
              <span className="max-w-full break-words sm:break-normal">Categories</span>
            </Link>
            <Link href="/wishlist" className={`${navLinkClass} rounded-md sm:rounded-full`}>
              <span>Wishlist</span>
              {wishCount > 0 ? (
                <span className="rounded-full bg-[var(--gold)]/25 px-1.5 py-0.5 text-[10px] font-semibold text-[var(--gold)] tabular-nums sm:px-2 sm:text-xs">
                  {wishCount}
                </span>
              ) : null}
            </Link>
            <Link href="/cart" className={`${navLinkClass} rounded-md sm:rounded-full`}>
              <span>Cart</span>
              {totalItems > 0 ? (
                <span className="rounded-full bg-[var(--gold)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--on-gold)] tabular-nums shadow-sm sm:px-2 sm:text-xs">
                  {totalItems}
                </span>
              ) : null}
            </Link>
          </div>

          <div className="flex w-full min-w-0 flex-wrap items-center justify-end gap-2 pl-0.5 sm:ml-auto sm:w-auto sm:flex-nowrap sm:pl-1">
            <ThemeToggle />

            {isAdmin ? (
              <Link
                href="/admin"
                className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-full border border-[var(--gold)]/45 bg-[var(--gold)]/12 px-3 py-2 text-xs font-semibold text-[var(--gold)] shadow-sm transition hover:bg-[var(--gold)]/22 sm:min-h-11 sm:px-3.5 sm:text-sm"
              >
                Admin
              </Link>
            ) : null}

            {!isSignedIn ? (
              <div className="flex min-w-0 items-center justify-end gap-1 sm:shrink-0 sm:gap-2">
                <SignInButton mode="modal">
                  <button
                    type="button"
                    className="min-h-10 rounded-lg px-2 text-xs font-medium text-[var(--foreground-muted)] transition-colors hover:text-[var(--foreground)] sm:min-h-11 sm:px-3 sm:text-sm"
                  >
                    Log in
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button
                    type="button"
                    className="min-h-10 shrink-0 rounded-full border border-[var(--border)] bg-[var(--surface-elevated)]/40 px-3 py-2 text-xs font-medium text-[var(--foreground)] shadow-sm transition hover:border-[var(--gold)]/45 hover:bg-[var(--nav-hover)] sm:min-h-11 sm:px-3.5 sm:text-sm"
                  >
                    Sign up
                  </button>
                </SignUpButton>
              </div>
            ) : (
              <div className="flex min-h-10 shrink-0 items-center justify-end pl-0.5 sm:min-h-11">
                <UserButton />
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
