import Image from "next/image";
import { getSession } from "@/lib/session";
import { getDb, sql } from "@/lib/db";
import { formatDate } from "@/lib/format";

export default async function LeadsPage() {
  const session = await getSession();
  const db = await getDb();

  const inquiries = await db
    .request()
    .input("companyId", sql.Int, session!.companyId)
    .query(`
      SELECT i.id, i.name, i.phone, i.email, i.message, i.created_at, e.full_name AS employee_name
      FROM inquiries i
      LEFT JOIN employees e ON e.id = i.employee_id
      WHERE i.company_id = @companyId
      ORDER BY i.created_at DESC
    `);

  const scannedCards = await db
    .request()
    .input("companyId", sql.Int, session!.companyId)
    .query(`
      SELECT cl.id, cl.name, cl.phone, cl.email, cl.company, cl.card_image, cl.created_at, e.full_name AS employee_name
      FROM contact_leads cl
      LEFT JOIN employees e ON e.id = cl.employee_id
      WHERE cl.company_id = @companyId
      ORDER BY cl.created_at DESC
    `);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Leads
        </h1>
        <a
          href="/company/leads/export"
          className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
        >
          Export CSV
        </a>
      </div>

      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-950">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
          Inquiries
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800">
                <th className="py-2 pr-4 font-medium">Name</th>
                <th className="py-2 pr-4 font-medium">Phone</th>
                <th className="py-2 pr-4 font-medium">Email</th>
                <th className="py-2 pr-4 font-medium">Message</th>
                <th className="py-2 pr-4 font-medium">Via</th>
                <th className="py-2 pr-4 font-medium">Received</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.recordset.map((lead) => (
                <tr key={lead.id} className="border-b border-zinc-100 dark:border-zinc-900">
                  <td className="py-3 pr-4 font-medium">{lead.name}</td>
                  <td className="py-3 pr-4">{lead.phone}</td>
                  <td className="py-3 pr-4">{lead.email ?? "—"}</td>
                  <td className="py-3 pr-4 max-w-xs truncate">{lead.message ?? "—"}</td>
                  <td className="py-3 pr-4">{lead.employee_name ?? "—"}</td>
                  <td className="py-3 pr-4 text-zinc-400">{formatDate(lead.created_at)}</td>
                </tr>
              ))}
              {inquiries.recordset.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-zinc-400">
                    No inquiries yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-950">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
          Scanned Business Cards
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800">
                <th className="py-2 pr-4 font-medium">Card</th>
                <th className="py-2 pr-4 font-medium">Name</th>
                <th className="py-2 pr-4 font-medium">Phone</th>
                <th className="py-2 pr-4 font-medium">Email</th>
                <th className="py-2 pr-4 font-medium">Company</th>
                <th className="py-2 pr-4 font-medium">Scanned By</th>
                <th className="py-2 pr-4 font-medium">Received</th>
              </tr>
            </thead>
            <tbody>
              {scannedCards.recordset.map((lead) => (
                <tr key={lead.id} className="border-b border-zinc-100 dark:border-zinc-900">
                  <td className="py-3 pr-4">
                    {lead.card_image ? (
                      <Image
                        src={lead.card_image}
                        alt={lead.name}
                        width={56}
                        height={36}
                        className="rounded object-cover"
                      />
                    ) : (
                      <span className="text-zinc-400">—</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 font-medium">{lead.name}</td>
                  <td className="py-3 pr-4">{lead.phone}</td>
                  <td className="py-3 pr-4">{lead.email ?? "—"}</td>
                  <td className="py-3 pr-4">{lead.company ?? "—"}</td>
                  <td className="py-3 pr-4">{lead.employee_name ?? "—"}</td>
                  <td className="py-3 pr-4 text-zinc-400">{formatDate(lead.created_at)}</td>
                </tr>
              ))}
              {scannedCards.recordset.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-zinc-400">
                    No scanned business cards yet.
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
