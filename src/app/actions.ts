"use server";

import bcrypt from "bcryptjs";
import { getDb, sql } from "@/lib/db";
import { createSession, clearSession } from "@/lib/session";

export async function login(email: string, password: string) {
  const db = await getDb();
  const result = await db
    .request()
    .input("email", sql.NVarChar, email)
    .query(
      "SELECT id, username, password_hash, role, status, company_id FROM users WHERE email = @email"
    );

  const user = result.recordset[0];
  if (!user || user.status !== "active") {
    return { success: false, message: "Invalid email or password." };
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    return { success: false, message: "Invalid email or password." };
  }

  await createSession({
    userId: user.id,
    username: user.username,
    role: user.role,
    companyId: user.company_id ?? null,
  });

  const redirectTo = user.role === "super_admin" ? "/admin" : "/company";

  return { success: true, message: `Welcome, ${user.username}.`, redirectTo };
}

export async function logout() {
  await clearSession();
}
