import { notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { getDb, sql } from "@/lib/db";
import { updateEmployee } from "@/app/company/actions";
import SocialFields from "@/app/company/employees/SocialFields";

export default async function EditEmployeePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  const db = await getDb();

  const employeeResult = await db
    .request()
    .input("id", sql.Int, Number(id))
    .input("companyId", sql.Int, session!.companyId)
    .query("SELECT * FROM employees WHERE id = @id AND company_id = @companyId");

  const employee = employeeResult.recordset[0];
  if (!employee) notFound();

  const branches = await db
    .request()
    .input("companyId", sql.Int, session!.companyId)
    .query(
      "SELECT id, branch_name FROM branches WHERE company_id = @companyId ORDER BY branch_name"
    );

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Edit Employee
      </h1>

      <form
        action={updateEmployee}
        className="mt-6 flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-950"
      >
        <input type="hidden" name="employeeId" value={employee.id} />

        <Field label="Full Name *">
          <input name="fullName" required defaultValue={employee.full_name} className="input" />
        </Field>
        <Field label="Job Title">
          <input name="jobTitle" defaultValue={employee.job_title ?? ""} className="input" />
        </Field>
        <Field label="Department">
          <input name="department" defaultValue={employee.department ?? ""} className="input" />
        </Field>
        <Field label="Email">
          <input name="email" type="email" defaultValue={employee.email ?? ""} className="input" />
        </Field>
        <Field label="Phone">
          <input name="phone" defaultValue={employee.phone ?? ""} className="input" placeholder="+60123456789" />
        </Field>
        <Field label="Bio">
          <textarea name="bio" rows={3} defaultValue={employee.bio ?? ""} className="input" />
        </Field>
        <SocialFields defaultValues={employee} />
        <Field label="Branch">
          <select name="branchId" defaultValue={employee.branch_id ?? ""} className="input">
            <option value="">No branch</option>
            {branches.recordset.map((b) => (
              <option key={b.id} value={b.id}>
                {b.branch_name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Profile Photo (leave empty to keep current)">
          <input type="file" name="photo" accept="image/*" className="input" />
        </Field>

        <button
          type="submit"
          className="mt-2 rounded-lg bg-blue-900 py-3 font-semibold text-white transition-colors hover:bg-blue-800"
        >
          Save Changes
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
