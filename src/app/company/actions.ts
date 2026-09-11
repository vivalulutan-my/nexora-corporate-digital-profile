"use server";

import { redirect } from "next/navigation";
import path from "path";
import { mkdir } from "fs/promises";
import QRCode from "qrcode";
import { getDb, sql } from "@/lib/db";
import { getSession } from "@/lib/session";
import { saveUpload } from "@/lib/upload";

async function requireCompanySession() {
  const session = await getSession();
  if (!session || !session.companyId) {
    throw new Error("Not authorized.");
  }
  return session;
}

function slugify(name: string) {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") +
    "-" +
    Date.now()
  );
}

export async function createEmployee(formData: FormData) {
  const session = await requireCompanySession();
  const companyId = session.companyId!;

  const fullName = String(formData.get("fullName") ?? "").trim();
  const jobTitle = String(formData.get("jobTitle") ?? "").trim();
  const department = String(formData.get("department") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const branchId = formData.get("branchId")
    ? Number(formData.get("branchId"))
    : null;
  const photoFile = formData.get("photo") as File | null;

  if (!fullName) {
    return { success: false, message: "Full name is required." };
  }

  const photoPath = photoFile ? await saveUpload(photoFile, "employees") : null;
  const slug = slugify(fullName);
  const cardUrl = `/card/${slug}`;

  const qrDir = path.join(process.cwd(), "public", "uploads", "qrcodes");
  await mkdir(qrDir, { recursive: true });
  const qrFilename = `${slug}.png`;
  await QRCode.toFile(path.join(qrDir, qrFilename), cardUrl, { width: 300 });
  const qrPath = `/uploads/qrcodes/${qrFilename}`;

  const db = await getDb();
  await db
    .request()
    .input("companyId", sql.Int, companyId)
    .input("branchId", sql.Int, branchId)
    .input("fullName", sql.NVarChar, fullName)
    .input("jobTitle", sql.NVarChar, jobTitle || null)
    .input("department", sql.NVarChar, department || null)
    .input("email", sql.NVarChar, email || null)
    .input("phone", sql.NVarChar, phone || null)
    .input("profilePhoto", sql.NVarChar, photoPath)
    .input("cardSlug", sql.NVarChar, slug)
    .input("cardUrl", sql.NVarChar, cardUrl)
    .input("qrCodePath", sql.NVarChar, qrPath)
    .query(`
      INSERT INTO employees
        (company_id, branch_id, full_name, job_title, department, email, phone, profile_photo, card_slug, card_url, qr_code_path, status)
      VALUES
        (@companyId, @branchId, @fullName, @jobTitle, @department, @email, @phone, @profilePhoto, @cardSlug, @cardUrl, @qrCodePath, 'active')
    `);

  redirect("/company/employees");
}

export async function toggleEmployeeStatus(employeeId: number, newStatus: string) {
  const session = await requireCompanySession();
  const db = await getDb();
  await db
    .request()
    .input("id", sql.Int, employeeId)
    .input("companyId", sql.Int, session.companyId)
    .input("status", sql.VarChar, newStatus)
    .query(
      "UPDATE employees SET status = @status WHERE id = @id AND company_id = @companyId"
    );
  redirect("/company/employees");
}

export async function createBranch(formData: FormData) {
  const session = await requireCompanySession();
  const companyId = session.companyId!;

  const branchName = String(formData.get("branchName") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  if (!branchName) {
    return { success: false, message: "Branch name is required." };
  }

  const db = await getDb();
  await db
    .request()
    .input("companyId", sql.Int, companyId)
    .input("branchName", sql.NVarChar, branchName)
    .input("address", sql.NVarChar, address || null)
    .input("phone", sql.NVarChar, phone || null)
    .input("email", sql.NVarChar, email || null)
    .query(`
      INSERT INTO branches (company_id, branch_name, address, phone, email)
      VALUES (@companyId, @branchName, @address, @phone, @email)
    `);

  redirect("/company/branches");
}
