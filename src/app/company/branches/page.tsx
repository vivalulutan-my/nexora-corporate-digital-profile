import { getSession } from "@/lib/session";
import { getDb, sql } from "@/lib/db";
import { createBranch } from "@/app/company/actions";
import BranchRow from "./BranchRow";

export default async function BranchesPage() {
  const session = await getSession();
  const db = await getDb();

  const branches = await db
    .request()
    .input("companyId", sql.Int, session!.companyId)
    .query(`
      SELECT b.id, b.branch_name, b.address, b.phone, b.email, b.city, b.state,
        (SELECT COUNT(*) FROM employees e WHERE e.branch_id = b.id) AS employee_count
      FROM branches b
      WHERE b.company_id = @companyId
      ORDER BY b.created_at DESC
    `);

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Branches
      </h1>

      <form
        action={createBranch}
        className="mt-6 flex max-w-xl flex-col gap-4 rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-950"
      >
        <input name="branchName" placeholder="Branch Name" required className="input" />
        <input name="address" placeholder="Address" className="input" />
        <div className="grid grid-cols-2 gap-4">
          <input name="city" placeholder="City" className="input" />
          <input name="state" placeholder="State" className="input" />
          <input name="postcode" placeholder="Postcode" className="input" />
          <input name="country" placeholder="Country" className="input" />
        </div>
        <input name="phone" placeholder="Phone" className="input" />
        <input name="email" placeholder="Email" className="input" />
        <button
          type="submit"
          className="mt-2 rounded-lg bg-blue-900 py-3 font-semibold text-white transition-colors hover:bg-blue-800"
        >
          Add Branch
        </button>
      </form>

      <div className="mt-8 rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-950">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800">
              <th className="py-2 pr-4 font-medium">Branch</th>
              <th className="py-2 pr-4 font-medium">Address</th>
              <th className="py-2 pr-4 font-medium">City / State</th>
              <th className="py-2 pr-4 font-medium">Employees</th>
              <th className="py-2 pr-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {branches.recordset.map((b) => (
              <BranchRow key={b.id} branch={b} />
            ))}
            {branches.recordset.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-zinc-400">
                  No branches yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
