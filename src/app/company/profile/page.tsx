import { getSession } from "@/lib/session";
import { getDb, sql } from "@/lib/db";

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

      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-950">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Row label="Company Name" value={company.company_name} />
          <Row label="Website" value={company.website} />
          <Row label="Email" value={company.email} />
          <Row label="Phone" value={company.phone} />
          <Row label="Address" value={company.address} />
          <Row
            label="City / State"
            value={[company.city, company.state].filter(Boolean).join(", ")}
          />
          <Row label="License No." value={company.license_no} />
          <Row label="Status" value={company.status} />
          <Row
            label="Subscription"
            value={`${company.start_date?.toISOString?.().slice(0, 10) ?? "—"} → ${
              company.end_date?.toISOString?.().slice(0, 10) ?? "—"
            }`}
          />
        </dl>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-xs text-zinc-500">{label}</dt>
      <dd className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
        {value || "—"}
      </dd>
    </div>
  );
}
