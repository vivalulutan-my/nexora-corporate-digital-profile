"use client";

import { useState } from "react";
import {
  updateSubAdmin,
  resetSubAdminPassword,
  terminateSubAdmin,
} from "@/app/admin/actions";
import { formatDate } from "@/lib/format";

type Admin = {
  id: number;
  username: string;
  email: string;
  status: string;
  last_login: Date | string | null;
};

export default function AdminRow({
  admin,
  companyId,
}: {
  admin: Admin;
  companyId: number;
}) {
  const [username, setUsername] = useState(admin.username);
  const [email, setEmail] = useState(admin.email);
  const [newPassword, setNewPassword] = useState("");

  return (
    <tr className="border-b border-zinc-100 dark:border-zinc-900">
      <td className="py-3 pr-4 font-medium">{admin.username}</td>
      <td className="py-3 pr-4">{admin.email}</td>
      <td className="py-3 pr-4">
        <span
          className={
            admin.status === "active"
              ? "text-green-600 font-semibold"
              : "text-zinc-400 font-semibold"
          }
        >
          {admin.status}
        </span>
      </td>
      <td className="py-3 pr-4 text-zinc-400">
        {formatDate(admin.last_login) ?? "Never Login"}
      </td>
      <td className="py-3 pr-4">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input w-32"
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input w-48"
            />
            <button
              onClick={() => updateSubAdmin(admin.id, companyId, username, email)}
              className="rounded-lg bg-blue-900 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-800"
            >
              Save
            </button>
          </div>
          <div className="flex gap-2">
            <input
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password"
              className="input w-40"
            />
            <button
              onClick={() =>
                resetSubAdminPassword(admin.id, companyId, newPassword)
              }
              className="rounded-lg bg-amber-500 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-600"
            >
              Reset Password
            </button>
            <button
              onClick={() => terminateSubAdmin(admin.id, companyId)}
              className="rounded-lg bg-red-500 px-3 py-1 text-xs font-semibold text-white hover:bg-red-600"
            >
              Terminate
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
}
