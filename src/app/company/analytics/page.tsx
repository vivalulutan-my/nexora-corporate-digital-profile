import Link from "next/link";
import { getSession } from "@/lib/session";
import { getDb, sql } from "@/lib/db";
import VisitsChart from "@/components/VisitsChart";

const RANGE_PRESETS = [
  { key: "7", label: "Last 7 days" },
  { key: "30", label: "Last 30 days" },
  { key: "90", label: "Last 90 days" },
] as const;

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function buildDailySeries(
  rows: { day: Date | string; total: number }[],
  days: number
) {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const key =
      row.day instanceof Date ? toISODate(row.day) : String(row.day).slice(0, 10);
    counts.set(key, row.total);
  }

  const series: { date: string; count: number }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = toISODate(d);
    series.push({ date: key, count: counts.get(key) ?? 0 });
  }
  return series;
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range } = await searchParams;
  const days = RANGE_PRESETS.some((r) => r.key === range) ? Number(range) : 30;

  const session = await getSession();
  const db = await getDb();

  const dailyViews = await db
    .request()
    .input("companyId", sql.Int, session!.companyId)
    .input("days", sql.Int, days)
    .query(`
      SELECT CAST(viewed_at AS DATE) AS day, COUNT(*) AS total
      FROM card_views
      WHERE company_id = @companyId
        AND viewed_at >= DATEADD(day, -@days, CAST(SYSDATETIME() AS DATE))
      GROUP BY CAST(viewed_at AS DATE)
      ORDER BY day
    `);

  const series = buildDailySeries(dailyViews.recordset, days);
  const totalInRange = series.reduce((sum, p) => sum + p.count, 0);

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

      <div className="mt-4 flex gap-1">
        {RANGE_PRESETS.map((preset) => (
          <Link
            key={preset.key}
            href={`/company/analytics?range=${preset.key}`}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              days === Number(preset.key)
                ? "bg-blue-900 text-white"
                : "text-zinc-600 hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-800"
            }`}
          >
            {preset.label}
          </Link>
        ))}
      </div>

      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-950">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            Card Views Over Time
          </h2>
          <p className="text-sm text-zinc-500">
            {totalInRange} views in this range
          </p>
        </div>
        <div className="mt-4">
          <VisitsChart data={series} />
        </div>
      </div>

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
