import { getSession } from "@/lib/session";
import { getDb, sql } from "@/lib/db";

export default async function AnalyticsPage() {
  const session = await getSession();
  const db = await getDb();

  const byType = await db
    .request()
    .input("companyId", sql.Int, session!.companyId)
    .query(`
      SELECT event_type, COUNT(*) AS total
      FROM analytics
      WHERE company_id = @companyId
      GROUP BY event_type
      ORDER BY total DESC
    `);

  const topEmployees = await db
    .request()
    .input("companyId", sql.Int, session!.companyId)
    .query(`
      SELECT TOP 10 e.full_name, COUNT(cv.id) AS views
      FROM employees e
      LEFT JOIN card_views cv ON cv.employee_id = e.id
      WHERE e.company_id = @companyId
      GROUP BY e.full_name
      ORDER BY views DESC
    `);

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Analytics
      </h1>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-950">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            Events by Type
          </h2>
          <ul className="mt-4 flex flex-col gap-2 text-sm">
            {byType.recordset.map((row) => (
              <li key={row.event_type} className="flex justify-between">
                <span className="capitalize">{row.event_type ?? "unknown"}</span>
                <span className="font-semibold">{row.total}</span>
              </li>
            ))}
            {byType.recordset.length === 0 && (
              <li className="text-zinc-400">No analytics events yet.</li>
            )}
          </ul>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-950">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            Most Viewed Cards
          </h2>
          <ul className="mt-4 flex flex-col gap-2 text-sm">
            {topEmployees.recordset.map((row) => (
              <li key={row.full_name} className="flex justify-between">
                <span>{row.full_name}</span>
                <span className="font-semibold">{row.views}</span>
              </li>
            ))}
            {topEmployees.recordset.length === 0 && (
              <li className="text-zinc-400">No card views yet.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
