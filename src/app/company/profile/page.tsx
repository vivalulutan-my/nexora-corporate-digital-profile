import Image from "next/image";
import { getSession } from "@/lib/session";
import { getDb, sql } from "@/lib/db";
import { updateCompanyProfile } from "@/app/company/actions";
import SocialFields from "@/components/SocialFields";

export default async function CompanyProfilePage() {
  const session = await getSession();
  const db = await getDb();

  const result = await db
    .request()
    .input("id", sql.Int, session!.companyId)
    .query("SELECT * FROM companies WHERE id = @id");

  const company = result.recordset[0];

  if (!company) {
    return <p className="text-zinc-500">Company not found.</p>;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Company Profile
      </h1>

      <div className="mt-6 flex items-center gap-6 rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-950">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900">
          {company.logo && (
            <Image
              src={company.logo}
              alt={company.company_name}
              width={64}
              height={64}
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <div>
          <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            {company.company_name}
          </p>
          <p className="text-sm text-zinc-500">{company.website}</p>
          <p className="text-xs uppercase tracking-wide text-zinc-400">
            {company.status} · License {company.license_no ?? "—"}
          </p>
        </div>
      </div>

      <form
        action={updateCompanyProfile}
        className="mt-6 flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-950"
      >
        <Field label="Company Bio">
          <textarea
            name="companyBio"
            rows={3}
            defaultValue={company.company_bio ?? ""}
            className="input"
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Phone">
            <input name="phone" defaultValue={company.phone ?? ""} className="input" />
          </Field>
          <Field label="Email">
            <input
              name="email"
              type="email"
              defaultValue={company.email ?? ""}
              className="input"
            />
          </Field>
        </div>

        <Field label="Address">
          <input name="address" defaultValue={company.address ?? ""} className="input" />
        </Field>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label="City">
            <input name="city" defaultValue={company.city ?? ""} className="input" />
          </Field>
          <Field label="State">
            <input name="state" defaultValue={company.state ?? ""} className="input" />
          </Field>
          <Field label="Postcode">
            <input name="postcode" defaultValue={company.postcode ?? ""} className="input" />
          </Field>
          <Field label="Country">
            <input name="country" defaultValue={company.country ?? ""} className="input" />
          </Field>
        </div>

        <SocialFields defaultValues={company} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Logo (leave empty to keep current)">
            <input type="file" name="logo" accept="image/*" className="input" />
          </Field>
          <Field label="Card Background (leave empty to keep current)">
            <input type="file" name="background" accept="image/*" className="input" />
          </Field>
        </div>

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
