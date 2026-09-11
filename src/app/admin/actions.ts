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

  const redirectTo = String(formData.get("redirectTo") ?? "/admin/subadmins");
  redirect(redirectTo);
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

export async function updateSubAdmin(
  userId: number,
  companyId: number,
  username: string,
  email: string
) {
  await requireSuperAdmin();
  const db = await getDb();
  await db
    .request()
    .input("userId", sql.Int, userId)
    .input("username", sql.NVarChar, username)
    .input("email", sql.NVarChar, email)
    .query("UPDATE users SET username = @username, email = @email WHERE id = @userId");
  redirect(`/admin/companies/${companyId}/admins`);
}

export async function resetSubAdminPassword(
  userId: number,
  companyId: number,
  newPassword: string
) {
  await requireSuperAdmin();
  if (!newPassword) return { success: false, message: "Password is required." };

  const passwordHash = await bcrypt.hash(newPassword, 10);
  const db = await getDb();
  await db
    .request()
    .input("userId", sql.Int, userId)
    .input("passwordHash", sql.NVarChar, passwordHash)
    .query("UPDATE users SET password_hash = @passwordHash WHERE id = @userId");
  redirect(`/admin/companies/${companyId}/admins`);
}

export async function terminateSubAdmin(userId: number, companyId: number) {
  await requireSuperAdmin();
  const db = await getDb();
  await db
    .request()
    .input("userId", sql.Int, userId)
    .query("UPDATE users SET status = 'disabled' WHERE id = @userId");
  redirect(`/admin/companies/${companyId}/admins`);
}

export async function toggleCompanyStatus(companyId: number, newStatus: string) {
  await requireSuperAdmin();
  const db = await getDb();
  await db
    .request()
    .input("companyId", sql.Int, companyId)
    .input("status", sql.VarChar, newStatus)
    .query(
      "UPDATE companies SET status = @status, updated_at = SYSDATETIME() WHERE id = @companyId"
    );
  redirect("/admin");
}

export async function updateLicense(formData: FormData) {
  await requireSuperAdmin();

  const companyId = Number(formData.get("companyId"));
  const licenseNo = String(formData.get("licenseNo") ?? "").trim();
  const endDate = String(formData.get("endDate") ?? "") || null;

  if (!companyId || !licenseNo) {
    return { success: false, message: "License limit is required." };
  }

  const db = await getDb();
  await db
    .request()
    .input("companyId", sql.Int, companyId)
    .input("licenseNo", sql.NVarChar, licenseNo)
    .input("endDate", sql.Date, endDate)
    .query(`
      UPDATE companies
      SET license_no = @licenseNo, end_date = @endDate, updated_at = SYSDATETIME()
      WHERE id = @companyId
    `);

  redirect("/admin");
}
