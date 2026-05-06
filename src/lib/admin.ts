import type { User } from "@clerk/nextjs/server";

export function isAdminUser(user: User | null | undefined): boolean {
  if (!user) return false;
  const meta = user.publicMetadata as { role?: string } | undefined;
  if (meta?.role === "admin") return true;
  const emails =
    process.env.ADMIN_EMAILS?.split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean) ?? [];
  const primary = user.primaryEmailAddress?.emailAddress?.toLowerCase();
  if (primary && emails.includes(primary)) return true;
  const anyEmail = user.emailAddresses.some((e) =>
    emails.includes(e.emailAddress.toLowerCase()),
  );
  return anyEmail;
}
