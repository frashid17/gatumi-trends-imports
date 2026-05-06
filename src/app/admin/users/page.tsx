import { clerkClient } from "@clerk/nextjs/server";
import { setUserAdminRole } from "@/app/admin/actions";

type UserListItem = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  primaryEmail: string;
  createdAt: Date | null;
  isAdmin: boolean;
};

function fullName(u: UserListItem): string {
  const joined = [u.firstName, u.lastName].filter(Boolean).join(" ").trim();
  return joined || "Unnamed user";
}

export default async function AdminUsersPage() {
  const client = await clerkClient();
  const res = await client.users.getUserList({ limit: 200, orderBy: "-created_at" });
  const users: UserListItem[] = res.data.map((u) => ({
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    primaryEmail: u.primaryEmailAddress?.emailAddress ?? "—",
    createdAt: u.createdAt ? new Date(u.createdAt) : null,
    isAdmin: (u.publicMetadata as { role?: string } | undefined)?.role === "admin",
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-[var(--foreground)] sm:text-3xl">
          Users
        </h2>
        <p className="mt-2 text-sm text-[var(--foreground-muted)]">
          Every signed-up user appears here. You can grant or remove admin access.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-[var(--surface-elevated)]/55 text-left text-xs uppercase tracking-wider text-[var(--foreground-muted)]">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-[var(--border)] align-middle">
                  <td className="px-4 py-3 font-medium text-[var(--foreground)]">{fullName(u)}</td>
                  <td className="px-4 py-3 text-[var(--foreground-muted)]">{u.primaryEmail}</td>
                  <td className="px-4 py-3 text-[var(--foreground-muted)]">
                    {u.createdAt ? u.createdAt.toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {u.isAdmin ? (
                      <span className="rounded-full bg-[var(--gold)]/15 px-2.5 py-1 text-xs font-semibold text-[var(--gold)]">
                        Admin
                      </span>
                    ) : (
                      <span className="rounded-full bg-[var(--surface-elevated)]/70 px-2.5 py-1 text-xs font-medium text-[var(--foreground-muted)]">
                        User
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <form action={setUserAdminRole}>
                      <input type="hidden" name="user_id" value={u.id} />
                      <input type="hidden" name="make_admin" value={u.isAdmin ? "0" : "1"} />
                      <button
                        type="submit"
                        className="rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)]/45 px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] transition hover:border-[var(--gold)]/40 hover:bg-[var(--nav-hover)]"
                      >
                        {u.isAdmin ? "Remove admin" : "Make admin"}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {users.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-[var(--foreground-muted)]" colSpan={5}>
                    No users found yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
