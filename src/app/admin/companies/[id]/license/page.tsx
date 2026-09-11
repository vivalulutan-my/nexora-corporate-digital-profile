import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb, sql } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { updateLicense } from "@/app/admin/actions";

export default async function ManageLicensePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = await getDb();

  const result = await db
    .request()
    .input("id", sql.Int, Number(id))
    .query(`
      SELECT c.id, c.company_name, c.license_no, c.end_date,
        (SELECT COUNT(*) FROM employees e WHERE e.company_id = c.id) AS employee_count
      FROM companies c
      WHERE c.id = @id
    `);

  const company = result.recordset[0];
  if (!company) notFound();

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        License Management
      </h1>

      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-950">
        <div className="rounded-lg bg-blue-50 p-4 text-sm dark:bg-blue-950">
          <p>
            <span className="font-semibold">Company:</span> {company.company_name}
          </p>
          <p>
            <span className="font-semibold">Current License:</span>{" "}
            {company.license_no ?? "—"}
          </p>
          <p>
            <span className="font-semibold">Employees Used:</span>{" "}
            {company.employee_count}
          </p>
          <p>
            <span className="font-semibold">Subscription End:</span>{" "}
            {formatDate(company.end_date) ?? "—"}
          </p>
        </div>

        <p className="mt-3 text-sm text-amber-600">
          License reduction allowed only during subscription renewal.
        </p>

        <form action={updateLicense} className="mt-4 flex flex-col gap-4">
          <input type="hidden" name="companyId" value={company.id} />

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              License Limit
            </span>
            <input
              name="licenseNo"
              type="number"
              min={company.employee_count}
              defaultValue={company.license_no ?? ""}
              required
              className="input"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              Subscription End Date
            </span>
            <input
              name="endDate"
              type="date"
              defaultValue={
                company.end_date instanceof Date
                  ? company.end_date.toISOString().slice(0, 10)
                  : ""
              }
              className="input"
            />
          </label>

          <button
            type="submit"
            className="mt-2 rounded-lg bg-blue-900 py-3 font-semibold text-white hover:bg-blue-800"
          >
            Update License
          </button>

          <Link
            href="/admin"
            className="text-sm text-blue-700 hover:underline dark:text-blue-400"
          >
            &larr; Back to Dashboard
          </Link>
        </form>
      </div>
    </div>
  );
}
