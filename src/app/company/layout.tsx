import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getDb, sql } from "@/lib/db";
import LogoutButton from "@/components/LogoutButton";

export default async function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role === "super_admin" || !session.companyId) {
    redirect("/");
  }

  const db = await getDb();
  const result = await db
    .request()
    .input("id", sql.Int, session.companyId)
    .query("SELECT company_name FROM companies WHERE id = @id");
  const companyName = result.recordset[0]?.company_name ?? "Company";

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 shrink-0 bg-blue-950 px-6 py-8 text-white">
        <h1 className="text-2xl font-bold">Nexora</h1>
        <p className="mt-1 text-xs text-blue-300">{companyName}</p>

        <nav className="mt-10 flex flex-col gap-1">
          <Link href="/company" className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-blue-900">
            Dashboard
          </Link>
          <p className="mt-4 px-3 text-xs uppercase tracking-wide text-blue-400">
            Employees
          </p>
          <Link
            href="/company/employees"
            className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-blue-900"
          >
            Manage Employees
          </Link>
          <Link
            href="/company/employees/create"
            className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-blue-900"
          >
            Create Employee
          </Link>
          <p className="mt-4 px-3 text-xs uppercase tracking-wide text-blue-400">
            Branches
          </p>
          <Link
            href="/company/branches"
            className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-blue-900"
          >
            Manage Branches
          </Link>
          <Link
            href="/company/analytics"
            className="mt-4 rounded-lg px-3 py-2 text-sm font-medium hover:bg-blue-900"
          >
            Analytics
          </Link>
          <Link
            href="/company/profile"
            className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-blue-900"
          >
            Company Profile
          </Link>
          <LogoutButton />
        </nav>
      </aside>

      <main className="flex-1 bg-zinc-50 px-10 py-8 dark:bg-zinc-900">
        {children}
      </main>
    </div>
  );
}
