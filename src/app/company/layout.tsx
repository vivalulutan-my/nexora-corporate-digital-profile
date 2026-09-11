import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getDb, sql } from "@/lib/db";
import LogoutButton from "@/components/LogoutButton";
import DashboardShell from "@/components/DashboardShell";

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
    <DashboardShell
      title="Nexora"
      subtitle={companyName}
      nav={
        <>
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
            href="/company/leads"
            className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-blue-900"
          >
            Leads
          </Link>
          <Link
            href="/company/profile"
            className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-blue-900"
          >
            Company Profile
          </Link>
          <LogoutButton />
        </>
      }
    >
      {children}
    </DashboardShell>
  );
}
