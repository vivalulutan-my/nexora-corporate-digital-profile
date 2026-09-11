import { getSession } from "@/lib/session";
import { getDb, sql } from "@/lib/db";
import { createEmployee } from "@/app/company/actions";
import SocialFields from "@/components/SocialFields";

export default async function CreateEmployeePage() {
  const session = await getSession();
  const db = await getDb();
  const branches = await db
    .request()
    .input("companyId", sql.Int, session!.companyId)
    .query(
      "SELECT id, branch_name FROM branches WHERE company_id = @companyId ORDER BY branch_name"
    );

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Create Employee
      </h1>

      <form
        action={createEmployee}
        className="mt-6 flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-950"
      >
        <Field label="Full Name *">
          <input name="fullName" required className="input" />
        </Field>
        <Field label="Job Title">
          <input name="jobTitle" className="input" />
        </Field>
        <Field label="Department">
          <input name="department" className="input" />
        </Field>
        <Field label="Email">
          <input name="email" type="email" className="input" />
        </Field>
        <Field label="Phone">
          <input name="phone" className="input" placeholder="+60123456789" />
        </Field>
        <Field label="Bio">
          <textarea name="bio" rows={3} className="input" />
        </Field>
        <SocialFields />
        <Field label="Branch">
          <select name="branchId" className="input">
            <option value="">No branch</option>
            {branches.recordset.map((b) => (
              <option key={b.id} value={b.id}>
                {b.branch_name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Profile Photo">
          <input type="file" name="photo" accept="image/*" className="input" />
        </Field>

        <button
          type="submit"
          className="mt-2 rounded-lg bg-blue-900 py-3 font-semibold text-white transition-colors hover:bg-blue-800"
        >
          Create Digital Card
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </span>
      {children}
    </label>
  );
}
