import { NextResponse } from "next/server";
import { getDb, sql } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const db = await getDb();
  const result = await db
    .request()
    .input("slug", sql.NVarChar, slug)
    .query(`
      SELECT e.full_name, e.job_title, e.email, e.phone, c.company_name
      FROM employees e
      JOIN companies c ON c.id = e.company_id
      WHERE e.card_slug = @slug
    `);

  const employee = result.recordset[0];
  if (!employee) {
    return new NextResponse("Not found", { status: 404 });
  }

  const vcf = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${employee.full_name}`,
    `ORG:${employee.company_name}`,
    employee.job_title ? `TITLE:${employee.job_title}` : "",
    employee.phone ? `TEL:${employee.phone}` : "",
    employee.email ? `EMAIL:${employee.email}` : "",
    "END:VCARD",
  ]
    .filter(Boolean)
    .join("\n");

  return new NextResponse(vcf, {
    headers: {
      "Content-Type": "text/vcard",
      "Content-Disposition": `attachment; filename="${slug}.vcf"`,
    },
  });
}
