import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isAdminUser } from "@/lib/admin";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  if (!isAdminUser(user)) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-8">
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-2xl border border-[var(--border)] bg-gradient-to-b from-[var(--surface-solid)]/95 to-[var(--surface)]/92 p-4 backdrop-blur-xl sm:p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--gold)]">
              Admin
            </p>
            <h1 className="font-display mt-2 text-lg font-semibold text-[var(--foreground)]">
              Control center
            </h1>
            <p className="mt-1 text-xs text-[var(--foreground-muted)]">
              Products, categories, and settings.
            </p>

            <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-2 lg:overflow-visible lg:pb-0">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="inline-flex min-h-10 shrink-0 items-center rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)]/35 px-3 text-sm font-medium text-[var(--foreground-muted)] transition hover:border-[var(--gold)]/40 hover:text-[var(--foreground)] lg:flex lg:w-full"
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <Link
              href="/"
              className="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-[var(--gold)]/45 bg-[var(--gold)]/12 px-4 text-sm font-semibold text-[var(--gold)] transition hover:bg-[var(--gold)]/20"
            >
              View storefront
            </Link>
          </div>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
