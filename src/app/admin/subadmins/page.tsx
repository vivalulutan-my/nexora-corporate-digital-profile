import { getDb } from "@/lib/db";
import { createSubAdmin } from "@/app/admin/actions";
import SubAdminRow from "./SubAdminRow";

export default async function SubAdminsPage() {
  const db = await getDb();

  const companies = await db
    .request()
    .query("SELECT id, company_name FROM companies ORDER BY company_name");

  const subAdmins = await db.request().query(`
    SELECT u.id, u.username, u.email, u.status, u.created_at, c.company_name
    FROM users u
    LEFT JOIN companies c ON c.id = u.company_id
    WHERE u.role = 'sub_admin'
    ORDER BY u.created_at DESC
  `);

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Create Sub Admin
      </h1>

      <form
        action={createSubAdmin}
        className="mt-6 flex max-w-xl flex-col gap-4 rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-950"
      >
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            Company
          </span>
          <select name="companyId" required className="input">
            <option value="">Select a company</option>
            {companies.recordset.map((c) => (
              <option key={c.id} value={c.id}>
                {c.company_name}
              </option>
            ))}
          </select>
        </label>
        <input name="username" placeholder="Username" required className="input" />
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
          className="mt-2 rounded-lg bg-blue-900 py-3 font-semibold text-white transition-colors hover:bg-blue-800"
        >
          Create Sub Admin
        </button>
      </form>

      <div className="mt-8 rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-950">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
          Sub Admin List
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800">
                <th className="py-2 pr-4 font-medium">Username</th>
                <th className="py-2 pr-4 font-medium">Email</th>
                <th className="py-2 pr-4 font-medium">Company</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 pr-4 font-medium">Created</th>
                <th className="py-2 pr-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subAdmins.recordset.map((s) => (
                <SubAdminRow key={s.id} subAdmin={s} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
