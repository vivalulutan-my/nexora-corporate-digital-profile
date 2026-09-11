import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb, sql } from "@/lib/db";

export default async function CompanyEmployeesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = await getDb();

  const companyResult = await db
    .request()
    .input("id", sql.Int, Number(id))
    .query("SELECT id, company_name FROM companies WHERE id = @id");
  const company = companyResult.recordset[0];
  if (!company) notFound();

  const employees = await db
    .request()
    .input("companyId", sql.Int, company.id)
    .query(`
      SELECT e.id, e.full_name, e.job_title, e.status, e.card_slug, b.branch_name
      FROM employees e
      LEFT JOIN branches b ON b.id = e.branch_id
      WHERE e.company_id = @companyId
      ORDER BY e.full_name
    `);

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        {company.company_name} &mdash; Employees
      </h1>

      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-950">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800">
              <th className="py-2 pr-4 font-medium">Name</th>
              <th className="py-2 pr-4 font-medium">Job</th>
              <th className="py-2 pr-4 font-medium">Branch</th>
              <th className="py-2 pr-4 font-medium">Status</th>
              <th className="py-2 pr-4 font-medium">Card</th>
            </tr>
          </thead>
          <tbody>
            {employees.recordset.map((e) => (
              <tr key={e.id} className="border-b border-zinc-100 dark:border-zinc-900">
                <td className="py-3 pr-4 font-medium">{e.full_name}</td>
                <td className="py-3 pr-4">{e.job_title ?? "—"}</td>
                <td className="py-3 pr-4">{e.branch_name ?? "—"}</td>
                <td className="py-3 pr-4">
                  <span
                    className={
                      e.status === "active"
                        ? "text-green-600 font-semibold"
                        : "text-zinc-400 font-semibold"
                    }
                  >
                    {e.status}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  {e.card_slug ? (
                    <Link
                      href={`/card/${e.card_slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 hover:underline dark:text-blue-400"
                    >
                      View
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
            {employees.recordset.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-zinc-400">
                  No employees yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Link
        href="/admin"
        className="mt-4 inline-block text-sm text-blue-700 hover:underline dark:text-blue-400"
      >
        &larr; Back to Dashboard
      </Link>
    </div>
  );
}
