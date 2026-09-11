import Link from "next/link";
import { getSession } from "@/lib/session";
import { getDb, sql } from "@/lib/db";

export default async function CompanyDashboard() {
  const session = await getSession();
  const companyId = session!.companyId!;
  const db = await getDb();

  const stats = await db
    .request()
    .input("companyId", sql.Int, companyId)
    .query(`
      SELECT
        (SELECT COUNT(*) FROM employees WHERE company_id = @companyId) AS totalEmployees,
        (SELECT COUNT(*) FROM employees WHERE company_id = @companyId AND status = 'active') AS activeEmployees,
        (SELECT COUNT(*) FROM employees WHERE company_id = @companyId AND status = 'inactive') AS inactiveEmployees,
        (SELECT COUNT(*) FROM branches WHERE company_id = @companyId) AS totalBranches,
        (SELECT COUNT(*) FROM card_views WHERE company_id = @companyId) AS totalCardViews
    `);

  const recentEmployees = await db
    .request()
    .input("companyId", sql.Int, companyId)
    .query(`
      SELECT TOP 10 e.id, e.full_name, e.job_title, e.status, b.branch_name
      FROM employees e
      LEFT JOIN branches b ON b.id = e.branch_id
      WHERE e.company_id = @companyId
      ORDER BY e.created_at DESC
    `);

  const {
    totalEmployees,
    activeEmployees,
    inactiveEmployees,
    totalBranches,
    totalCardViews,
  } = stats.recordset[0];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Welcome, Company Dashboard
        </h1>
        <Link
          href="/company/employees/create"
          className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
        >
          + Create Employee
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Total Employees" value={totalEmployees} />
        <StatCard label="Active Employees" value={activeEmployees} />
        <StatCard label="Inactive Employees" value={inactiveEmployees} />
        <StatCard label="Total Branches" value={totalBranches} />
        <StatCard label="Total Card Views" value={totalCardViews} />
      </div>

      <div className="mt-8 rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-950">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
          Recent Employees
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800">
                <th className="py-2 pr-4 font-medium">Name</th>
                <th className="py-2 pr-4 font-medium">Job Title</th>
                <th className="py-2 pr-4 font-medium">Branch</th>
                <th className="py-2 pr-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentEmployees.recordset.map((e) => (
                <tr
                  key={e.id}
                  className="border-b border-zinc-100 dark:border-zinc-900"
                >
                  <td className="py-3 pr-4 font-medium">{e.full_name}</td>
                  <td className="py-3 pr-4">{e.job_title ?? "—"}</td>
                  <td className="py-3 pr-4">{e.branch_name ?? "—"}</td>
                  <td className="py-3 pr-4 capitalize">{e.status}</td>
                </tr>
              ))}
              {recentEmployees.recordset.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-zinc-400">
                    No employees yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-zinc-950">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        {value}
      </p>
    </div>
  );
}
