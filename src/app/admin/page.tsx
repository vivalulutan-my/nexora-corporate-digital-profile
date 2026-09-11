import { getDb } from "@/lib/db";
import { formatDate } from "@/lib/format";

type CompanyRow = {
  id: number;
  company_name: string;
  license_no: string | null;
  employee_count: number;
  status: string;
  start_date: Date | string | null;
  end_date: Date | string | null;
};

function subscriptionBadge(endDate: Date | string | null) {
  if (!endDate) return { label: "No subscription", className: "text-zinc-500" };
  const days = Math.ceil(
    (new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (days < 0) return { label: "Expired", className: "text-red-600 font-semibold" };
  if (days <= 30)
    return {
      label: `Expiring in ${days} days`,
      className: "text-amber-600 font-semibold",
    };
  return { label: "Active", className: "text-green-600 font-semibold" };
}

export default async function AdminDashboard() {
  const db = await getDb();

  const stats = await db.request().query(`
    SELECT
      (SELECT COUNT(*) FROM companies) AS totalCompanies,
      (SELECT COUNT(*) FROM employees) AS totalEmployees,
      (SELECT COUNT(*) FROM companies WHERE status = 'active') AS activeCompanies
  `);

  const companies = await db.request().query<CompanyRow>(`
    SELECT
      c.id,
      c.company_name,
      c.license_no,
      c.status,
      c.start_date,
      c.end_date,
      (SELECT COUNT(*) FROM employees e WHERE e.company_id = c.id) AS employee_count
    FROM companies c
    ORDER BY c.created_at DESC
  `);

  const { totalCompanies, totalEmployees, activeCompanies } =
    stats.recordset[0];

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Nexora Control Panel
      </h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Companies" value={totalCompanies} />
        <StatCard label="Total Employees" value={totalEmployees} />
        <StatCard label="Active Companies" value={activeCompanies} />
      </div>

      <div className="mt-8 rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-950">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
          Companies
        </h2>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800">
                <th className="py-2 pr-4 font-medium">Company</th>
                <th className="py-2 pr-4 font-medium">License Usage</th>
                <th className="py-2 pr-4 font-medium">Subscription</th>
                <th className="py-2 pr-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {companies.recordset.map((c) => {
                const limit = Number(c.license_no) || 0;
                const badge = subscriptionBadge(c.end_date);
                return (
                  <tr
                    key={c.id}
                    className="border-b border-zinc-100 dark:border-zinc-900"
                  >
                    <td className="py-3 pr-4 font-medium">
                      {c.company_name}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="h-1.5 w-28 rounded-full bg-zinc-200 dark:bg-zinc-800">
                        <div
                          className={`h-1.5 rounded-full ${
                            limit > 0 && c.employee_count > limit
                              ? "bg-red-500"
                              : "bg-blue-600"
                          }`}
                          style={{
                            width: `${
                              limit > 0
                                ? Math.min(
                                    (c.employee_count / limit) * 100,
                                    100
                                  )
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-zinc-500">
                        {c.employee_count} / {limit || "?"}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <div className={badge.className}>{badge.label}</div>
                      <div className="text-xs text-zinc-400">
                        {formatDate(c.start_date) ?? "—"} &rarr;{" "}
                        {formatDate(c.end_date) ?? "—"}
                      </div>
                    </td>
                    <td className="py-3 pr-4 capitalize">{c.status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-950">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
        {value}
      </p>
    </div>
  );
}
