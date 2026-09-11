import Image from "next/image";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { getDb, sql } from "@/lib/db";
import EmployeeRow from "./EmployeeRow";

export default async function ManageEmployeesPage() {
  const session = await getSession();
  const companyId = session!.companyId!;
  const db = await getDb();

  const employees = await db
    .request()
    .input("companyId", sql.Int, companyId)
    .query(`
      SELECT e.id, e.full_name, e.job_title, e.status, e.profile_photo, e.qr_code_path, b.branch_name
      FROM employees e
      LEFT JOIN branches b ON b.id = e.branch_id
      WHERE e.company_id = @companyId
      ORDER BY e.created_at DESC
    `);

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Employees
      </h1>

      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-950">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800">
                <th className="py-2 pr-4 font-medium">Photo</th>
                <th className="py-2 pr-4 font-medium">Name</th>
                <th className="py-2 pr-4 font-medium">Job</th>
                <th className="py-2 pr-4 font-medium">Branch</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 pr-4 font-medium">QR</th>
                <th className="py-2 pr-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {employees.recordset.map((e) => (
                <tr
                  key={e.id}
                  className="border-b border-zinc-100 dark:border-zinc-900"
                >
                  <td className="py-3 pr-4">
                    <div className="h-10 w-10 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                      {e.profile_photo && (
                        <Image
                          src={e.profile_photo}
                          alt={e.full_name}
                          width={40}
                          height={40}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                  </td>
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
                    {e.qr_code_path && (
                      <Image
                        src={e.qr_code_path}
                        alt="QR"
                        width={40}
                        height={40}
                      />
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex gap-2">
                      <Link
                        href={`/company/employees/${e.id}/edit`}
                        className="rounded-lg border border-zinc-300 px-3 py-1 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                      >
                        Edit
                      </Link>
                      <EmployeeRow id={e.id} status={e.status} />
                    </div>
                  </td>
                </tr>
              ))}
              {employees.recordset.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-zinc-400">
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
