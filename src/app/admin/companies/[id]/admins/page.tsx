import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb, sql } from "@/lib/db";
import { createSubAdmin } from "@/app/admin/actions";
import AdminRow from "./AdminRow";

export default async function CompanyAdminsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const companyId = Number(id);
  const db = await getDb();

  const companyResult = await db
    .request()
    .input("id", sql.Int, companyId)
    .query("SELECT id, company_name FROM companies WHERE id = @id");
  const company = companyResult.recordset[0];
  if (!company) notFound();

  const admins = await db
    .request()
    .input("companyId", sql.Int, companyId)
    .query(`
      SELECT id, username, email, status, last_login
      FROM users
      WHERE company_id = @companyId AND role = 'sub_admin'
      ORDER BY created_at DESC
    `);

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        {company.company_name} &mdash; Company Admin Management
      </h1>

      <div className="mt-6 max-w-xl rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-950">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
          Create Company Admin
        </h2>
        <form action={createSubAdmin} className="mt-4 flex flex-col gap-4">
          <input type="hidden" name="companyId" value={companyId} />
          <input
            type="hidden"
            name="redirectTo"
            value={`/admin/companies/${companyId}/admins`}
          />
          <input name="username" placeholder="Admin Name" required className="input" />
          <input
            name="email"
            type="email"
            placeholder="Email Address"
            required
            className="input"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            className="input"
          />
          <button
            type="submit"
            className="rounded-lg bg-blue-900 py-3 font-semibold text-white hover:bg-blue-800"
          >
            Create Admin
          </button>
        </form>
      </div>

      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-950">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
          Company Admin List
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800">
                <th className="py-2 pr-4 font-medium">Name</th>
                <th className="py-2 pr-4 font-medium">Email</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 pr-4 font-medium">Last Login</th>
                <th className="py-2 pr-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.recordset.map((admin) => (
                <AdminRow key={admin.id} admin={admin} companyId={companyId} />
              ))}
              {admins.recordset.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-zinc-400">
                    No admins yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
