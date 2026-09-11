import { notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { getDb, sql } from "@/lib/db";
import { updateBranch } from "@/app/company/actions";

export default async function EditBranchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  const db = await getDb();

  const result = await db
    .request()
    .input("id", sql.Int, Number(id))
    .input("companyId", sql.Int, session!.companyId)
    .query("SELECT * FROM branches WHERE id = @id AND company_id = @companyId");

  const branch = result.recordset[0];
  if (!branch) notFound();

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Edit Branch
      </h1>

      <form
        action={updateBranch}
        className="mt-6 flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-950"
      >
        <input type="hidden" name="branchId" value={branch.id} />

        <input
          name="branchName"
          defaultValue={branch.branch_name}
          required
          placeholder="Branch Name"
          className="input"
        />
        <input
          name="address"
          defaultValue={branch.address ?? ""}
          placeholder="Address"
          className="input"
        />
        <div className="grid grid-cols-2 gap-4">
          <input name="city" defaultValue={branch.city ?? ""} placeholder="City" className="input" />
          <input name="state" defaultValue={branch.state ?? ""} placeholder="State" className="input" />
          <input
            name="postcode"
            defaultValue={branch.postcode ?? ""}
            placeholder="Postcode"
            className="input"
          />
          <input
            name="country"
            defaultValue={branch.country ?? ""}
            placeholder="Country"
            className="input"
          />
        </div>
        <input name="phone" defaultValue={branch.phone ?? ""} placeholder="Phone" className="input" />
        <input name="email" defaultValue={branch.email ?? ""} placeholder="Email" className="input" />

        <button
          type="submit"
          className="mt-2 rounded-lg bg-blue-900 py-3 font-semibold text-white hover:bg-blue-800"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
