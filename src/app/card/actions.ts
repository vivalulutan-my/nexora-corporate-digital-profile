"use server";

import { getDb, sql } from "@/lib/db";

export async function submitInquiry(
  employeeId: number,
  companyId: number,
  name: string,
  phone: string,
  email: string,
  message: string
) {
  const db = await getDb();
  await db
    .request()
    .input("employeeId", sql.Int, employeeId)
    .input("companyId", sql.Int, companyId)
    .input("name", sql.NVarChar, name)
    .input("phone", sql.NVarChar, phone)
    .input("email", sql.NVarChar, email || null)
    .input("message", sql.NVarChar, message || null)
    .query(`
      INSERT INTO inquiries (employee_id, company_id, name, phone, email, message)
      VALUES (@employeeId, @companyId, @name, @phone, @email, @message)
    `);

  return { success: true };
}
