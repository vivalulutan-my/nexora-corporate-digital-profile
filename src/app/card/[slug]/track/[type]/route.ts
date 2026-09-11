import { NextRequest, NextResponse } from "next/server";
import { getDb, sql } from "@/lib/db";

const ALLOWED_TYPES = new Set(["call", "whatsapp", "email", "vcard"]);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; type: string }> }
) {
  const { slug, type } = await params;
  const url = req.nextUrl.searchParams.get("url");

  if (!url || !ALLOWED_TYPES.has(type)) {
    return new NextResponse("Bad request", { status: 400 });
  }

  const db = await getDb();
  const result = await db
    .request()
    .input("slug", sql.NVarChar, slug)
    .query("SELECT id, company_id FROM employees WHERE card_slug = @slug");

  const employee = result.recordset[0];
  if (employee) {
    await db
      .request()
      .input("employeeId", sql.Int, employee.id)
      .input("companyId", sql.Int, employee.company_id)
      .input("eventType", sql.NVarChar, type)
      .query(
        "INSERT INTO analytics (employee_id, company_id, event_type) VALUES (@employeeId, @companyId, @eventType)"
      );
  }

  return NextResponse.redirect(new URL(url, req.url));
}
