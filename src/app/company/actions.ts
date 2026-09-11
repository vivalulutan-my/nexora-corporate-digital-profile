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

const SOCIAL_FIELDS = [
  "facebook",
  "instagram",
  "twitter",
  "tiktok",
  "youtube",
  "linkedin",
  "xiaohongshu",
] as const;

function readSocialInputs(formData: FormData) {
  return SOCIAL_FIELDS.map((key) => ({
    column: `social_${key}`,
    value: String(formData.get(`social_${key}`) ?? "").trim() || null,
  }));
}

export async function createEmployee(formData: FormData) {
  const session = await requireCompanySession();
  const companyId = session.companyId!;

  const fullName = String(formData.get("fullName") ?? "").trim();
  const jobTitle = String(formData.get("jobTitle") ?? "").trim();
  const department = String(formData.get("department") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const branchId = formData.get("branchId")
    ? Number(formData.get("branchId"))
    : null;
  const cardTheme = String(formData.get("cardTheme") ?? "corporate").trim();
  const photoFile = formData.get("photo") as File | null;
  const socials = readSocialInputs(formData);

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
  const request = db
    .request()
    .input("companyId", sql.Int, companyId)
    .input("branchId", sql.Int, branchId)
    .input("fullName", sql.NVarChar, fullName)
    .input("jobTitle", sql.NVarChar, jobTitle || null)
    .input("department", sql.NVarChar, department || null)
    .input("bio", sql.NVarChar, bio || null)
    .input("email", sql.NVarChar, email || null)
    .input("phone", sql.NVarChar, phone || null)
    .input("profilePhoto", sql.NVarChar, photoPath)
    .input("cardSlug", sql.NVarChar, slug)
    .input("cardUrl", sql.NVarChar, cardUrl)
    .input("qrCodePath", sql.NVarChar, qrPath)
    .input("cardTheme", sql.VarChar, cardTheme);

  socials.forEach((s) => request.input(s.column, sql.NVarChar, s.value));

  await request.query(`
      INSERT INTO employees
        (company_id, branch_id, full_name, job_title, department, bio, email, phone, profile_photo, card_slug, card_url, qr_code_path, card_theme, status,
         ${socials.map((s) => s.column).join(", ")})
      VALUES
        (@companyId, @branchId, @fullName, @jobTitle, @department, @bio, @email, @phone, @profilePhoto, @cardSlug, @cardUrl, @qrCodePath, @cardTheme, 'active',
         ${socials.map((s) => `@${s.column}`).join(", ")})
    `);

  redirect("/company/employees");
}

export async function updateEmployee(formData: FormData) {
  const session = await requireCompanySession();
  const companyId = session.companyId!;

  const employeeId = Number(formData.get("employeeId"));
  const fullName = String(formData.get("fullName") ?? "").trim();
  const jobTitle = String(formData.get("jobTitle") ?? "").trim();
  const department = String(formData.get("department") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const branchId = formData.get("branchId")
    ? Number(formData.get("branchId"))
    : null;
  const cardTheme = String(formData.get("cardTheme") ?? "corporate").trim();
  const photoFile = formData.get("photo") as File | null;
  const socials = readSocialInputs(formData);

  if (!fullName || !employeeId) {
    return { success: false, message: "Full name is required." };
  }

  const photoPath = photoFile && photoFile.size > 0
    ? await saveUpload(photoFile, "employees")
    : null;

  const db = await getDb();
  const request = db
    .request()
    .input("id", sql.Int, employeeId)
    .input("companyId", sql.Int, companyId)
    .input("branchId", sql.Int, branchId)
    .input("fullName", sql.NVarChar, fullName)
    .input("jobTitle", sql.NVarChar, jobTitle || null)
    .input("department", sql.NVarChar, department || null)
    .input("bio", sql.NVarChar, bio || null)
    .input("email", sql.NVarChar, email || null)
    .input("phone", sql.NVarChar, phone || null)
    .input("cardTheme", sql.VarChar, cardTheme);

  socials.forEach((s) => request.input(s.column, sql.NVarChar, s.value));

  const photoSetClause = photoPath ? ", profile_photo = @profilePhoto" : "";
  if (photoPath) request.input("profilePhoto", sql.NVarChar, photoPath);

  await request.query(`
      UPDATE employees SET
        branch_id = @branchId,
        full_name = @fullName,
        job_title = @jobTitle,
        department = @department,
        bio = @bio,
        email = @email,
        phone = @phone,
        card_theme = @cardTheme,
        ${socials.map((s) => `${s.column} = @${s.column}`).join(", ")}
        ${photoSetClause}
      WHERE id = @id AND company_id = @companyId
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

export async function updateCompanyProfile(formData: FormData) {
  const session = await requireCompanySession();
  const companyId = session.companyId!;

  const companyBio = String(formData.get("companyBio") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const state = String(formData.get("state") ?? "").trim();
  const postcode = String(formData.get("postcode") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const logoFile = formData.get("logo") as File | null;
  const backgroundFile = formData.get("background") as File | null;
  const socials = readSocialInputs(formData);

  const logoPath =
    logoFile && logoFile.size > 0 ? await saveUpload(logoFile, "companies") : null;
  const backgroundPath =
    backgroundFile && backgroundFile.size > 0
      ? await saveUpload(backgroundFile, "companies")
      : null;

  const db = await getDb();
  const request = db
    .request()
    .input("id", sql.Int, companyId)
    .input("companyBio", sql.NVarChar, companyBio || null)
    .input("address", sql.NVarChar, address || null)
    .input("city", sql.NVarChar, city || null)
    .input("state", sql.NVarChar, state || null)
    .input("postcode", sql.NVarChar, postcode || null)
    .input("country", sql.NVarChar, country || null)
    .input("phone", sql.NVarChar, phone || null)
    .input("email", sql.NVarChar, email || null);

  socials.forEach((s) => request.input(s.column, sql.NVarChar, s.value));

  const extraSets: string[] = [];
  if (logoPath) {
    request.input("logo", sql.NVarChar, logoPath);
    extraSets.push("logo = @logo");
  }
  if (backgroundPath) {
    request.input("cardBackground", sql.NVarChar, backgroundPath);
    extraSets.push("card_background = @cardBackground");
  }

  await request.query(`
      UPDATE companies SET
        company_bio = @companyBio,
        address = @address,
        city = @city,
        state = @state,
        postcode = @postcode,
        country = @country,
        phone = @phone,
        email = @email,
        updated_at = SYSDATETIME(),
        ${socials.map((s) => `${s.column} = @${s.column}`).join(", ")}
        ${extraSets.length ? ", " + extraSets.join(", ") : ""}
      WHERE id = @id
    `);

  redirect("/company/profile");
}

function readBranchFields(formData: FormData) {
  return {
    branchName: String(formData.get("branchName") ?? "").trim(),
    address: String(formData.get("address") ?? "").trim() || null,
    phone: String(formData.get("phone") ?? "").trim() || null,
    email: String(formData.get("email") ?? "").trim() || null,
    city: String(formData.get("city") ?? "").trim() || null,
    state: String(formData.get("state") ?? "").trim() || null,
    postcode: String(formData.get("postcode") ?? "").trim() || null,
    country: String(formData.get("country") ?? "").trim() || null,
  };
}

export async function createBranch(formData: FormData) {
  const session = await requireCompanySession();
  const companyId = session.companyId!;
  const f = readBranchFields(formData);

  if (!f.branchName) {
    return { success: false, message: "Branch name is required." };
  }

  const db = await getDb();
  await db
    .request()
    .input("companyId", sql.Int, companyId)
    .input("branchName", sql.NVarChar, f.branchName)
    .input("address", sql.NVarChar, f.address)
    .input("phone", sql.NVarChar, f.phone)
    .input("email", sql.NVarChar, f.email)
    .input("city", sql.NVarChar, f.city)
    .input("state", sql.NVarChar, f.state)
    .input("postcode", sql.NVarChar, f.postcode)
    .input("country", sql.NVarChar, f.country)
    .query(`
      INSERT INTO branches (company_id, branch_name, address, phone, email, city, state, postcode, country)
      VALUES (@companyId, @branchName, @address, @phone, @email, @city, @state, @postcode, @country)
    `);

  redirect("/company/branches");
}

export async function updateBranch(formData: FormData) {
  const session = await requireCompanySession();
  const companyId = session.companyId!;
  const branchId = Number(formData.get("branchId"));
  const f = readBranchFields(formData);

  if (!f.branchName || !branchId) {
    return { success: false, message: "Branch name is required." };
  }

  const db = await getDb();
  await db
    .request()
    .input("id", sql.Int, branchId)
    .input("companyId", sql.Int, companyId)
    .input("branchName", sql.NVarChar, f.branchName)
    .input("address", sql.NVarChar, f.address)
    .input("phone", sql.NVarChar, f.phone)
    .input("email", sql.NVarChar, f.email)
    .input("city", sql.NVarChar, f.city)
    .input("state", sql.NVarChar, f.state)
    .input("postcode", sql.NVarChar, f.postcode)
    .input("country", sql.NVarChar, f.country)
    .query(`
      UPDATE branches SET
        branch_name = @branchName, address = @address, phone = @phone, email = @email,
        city = @city, state = @state, postcode = @postcode, country = @country
      WHERE id = @id AND company_id = @companyId
    `);

  redirect("/company/branches");
}

export async function deleteBranch(branchId: number) {
  const session = await requireCompanySession();
  const companyId = session.companyId!;
  const db = await getDb();

  await db
    .request()
    .input("branchId", sql.Int, branchId)
    .input("companyId", sql.Int, companyId)
    .query(
      "UPDATE employees SET branch_id = NULL WHERE branch_id = @branchId AND company_id = @companyId"
    );

  await db
    .request()
    .input("id", sql.Int, branchId)
    .input("companyId", sql.Int, companyId)
    .query("DELETE FROM branches WHERE id = @id AND company_id = @companyId");

  redirect("/company/branches");
}
