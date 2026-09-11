"use server";

import { getDb, sql } from "@/lib/db";
import { saveUpload } from "@/lib/upload";

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

  await db
    .request()
    .input("employeeId", sql.Int, employeeId)
    .input("companyId", sql.Int, companyId)
    .query(
      "INSERT INTO analytics (employee_id, company_id, event_type) VALUES (@employeeId, @companyId, 'inquiry')"
    );

  return { success: true };
}

export async function captureLead(formData: FormData) {
  const employeeId = Number(formData.get("employeeId"));
  const companyId = Number(formData.get("companyId"));
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();
  const cardImageFile = formData.get("cardImage") as File | null;

  if (!name || !phone || !employeeId || !companyId) {
    return { success: false, message: "Name and phone are required." };
  }

  const cardImagePath =
    cardImageFile && cardImageFile.size > 0
      ? await saveUpload(cardImageFile, "leads")
      : null;

  const db = await getDb();
  await db
    .request()
    .input("employeeId", sql.Int, employeeId)
    .input("companyId", sql.Int, companyId)
    .input("name", sql.NVarChar, name)
    .input("phone", sql.NVarChar, phone)
    .input("email", sql.NVarChar, email || null)
    .input("company", sql.NVarChar, company || null)
    .input("cardImage", sql.NVarChar, cardImagePath)
    .query(`
      INSERT INTO contact_leads (employee_id, company_id, name, phone, email, company, card_image)
      VALUES (@employeeId, @companyId, @name, @phone, @email, @company, @cardImage)
    `);

  await db
    .request()
    .input("employeeId", sql.Int, employeeId)
    .input("companyId", sql.Int, companyId)
    .query(
      "INSERT INTO analytics (employee_id, company_id, event_type) VALUES (@employeeId, @companyId, 'snapshot')"
    );

  return { success: true };
}
