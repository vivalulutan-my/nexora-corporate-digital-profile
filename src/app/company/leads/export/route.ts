import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getDb, sql } from "@/lib/db";

function csvEscape(value: unknown) {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET() {
  const session = await getSession();
  if (!session || !session.companyId) {
    return new NextResponse("Not authorized", { status: 401 });
  }

  const db = await getDb();
  const leads = await db
    .request()
    .input("companyId", sql.Int, session.companyId)
    .query(`
      SELECT i.name, i.phone, i.email, i.message, i.created_at, e.full_name AS employee_name
      FROM inquiries i
      LEFT JOIN employees e ON e.id = i.employee_id
      WHERE i.company_id = @companyId
      ORDER BY i.created_at DESC
    `);

  const header = ["Name", "Phone", "Email", "Message", "Employee", "Received At"];
  const rows = leads.recordset.map((lead) => [
    lead.name,
    lead.phone,
    lead.email,
    lead.message,
    lead.employee_name,
    lead.created_at instanceof Date ? lead.created_at.toISOString() : lead.created_at,
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map(csvEscape).join(","))
    .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="leads.csv"`,
    },
  });
}
