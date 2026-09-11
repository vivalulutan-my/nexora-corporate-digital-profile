"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { getDb, sql } from "@/lib/db";
import { getSession } from "@/lib/session";
import { saveUpload } from "@/lib/upload";

async function requireSuperAdmin() {
  const session = await getSession();
  if (!session || session.role !== "super_admin") {
    throw new Error("Not authorized.");
  }
  return session;
}

export async function createCompany(formData: FormData) {
  await requireSuperAdmin();

  const companyName = String(formData.get("companyName") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim();
  const licenseNo = String(formData.get("licenseNo") ?? "").trim();
  const startDate = String(formData.get("startDate") ?? "") || null;
  const endDate = String(formData.get("endDate") ?? "") || null;
  const logoFile = formData.get("logo") as File | null;
  const backgroundFile = formData.get("background") as File | null;

  if (!companyName || !website) {
    return { success: false, message: "Company name and website are required." };
  }

  const logoPath = logoFile ? await saveUpload(logoFile, "companies") : null;
  const backgroundPath = backgroundFile
    ? await saveUpload(backgroundFile, "companies")
    : null;

  const db = await getDb();
  await db
    .request()
    .input("companyName", sql.NVarChar, companyName)
    .input("website", sql.NVarChar, website)
    .input("licenseNo", sql.NVarChar, licenseNo || null)
    .input("startDate", sql.Date, startDate)
    .input("endDate", sql.Date, endDate)
    .input("logo", sql.NVarChar, logoPath ?? "")
    .input("background", sql.NVarChar, backgroundPath)
    .query(`
      INSERT INTO companies (company_name, website, license_no, start_date, end_date, logo, card_background)
      VALUES (@companyName, @website, @licenseNo, @startDate, @endDate, @logo, @background)
    `);

  redirect("/admin");
}

export async function createSubAdmin(formData: FormData) {
  await requireSuperAdmin();

  const username = String(formData.get("username") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const companyId = Number(formData.get("companyId"));

  if (!username || !email || !password || !companyId) {
    return { success: false, message: "All fields are required." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const db = await getDb();
  await db
    .request()
    .input("username", sql.NVarChar, username)
    .input("email", sql.NVarChar, email)
    .input("passwordHash", sql.NVarChar, passwordHash)
    .input("companyId", sql.Int, companyId)
    .query(`
      INSERT INTO users (username, email, password_hash, role, status, company_id)
      VALUES (@username, @email, @passwordHash, 'sub_admin', 'active', @companyId)
    `);

  redirect("/admin/subadmins");
}

export async function toggleSubAdminStatus(userId: number, newStatus: string) {
  await requireSuperAdmin();
  const db = await getDb();
  await db
    .request()
    .input("userId", sql.Int, userId)
    .input("status", sql.VarChar, newStatus)
    .query("UPDATE users SET status = @status WHERE id = @userId");
  redirect("/admin/subadmins");
}
