"use server";

import bcrypt from "bcryptjs";
import { getDb, sql } from "@/lib/db";

export async function login(email: string, password: string) {
  const db = await getDb();
  const result = await db
    .request()
    .input("email", sql.NVarChar, email)
    .query(
      "SELECT id, username, password_hash, role, status FROM users WHERE email = @email"
    );

  const user = result.recordset[0];
  if (!user || user.status !== "active") {
    return { success: false, message: "Invalid email or password." };
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    return { success: false, message: "Invalid email or password." };
  }

  return {
    success: true,
    message: `Welcome, ${user.username} (${user.role}).`,
  };
}
