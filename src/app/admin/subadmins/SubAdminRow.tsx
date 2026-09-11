"use client";

import { toggleSubAdminStatus } from "@/app/admin/actions";
import { formatDate } from "@/lib/format";

type SubAdmin = {
  id: number;
  username: string;
  email: string;
  status: string;
  created_at: Date | string;
  company_name: string | null;
};

export default function SubAdminRow({ subAdmin }: { subAdmin: SubAdmin }) {
  const nextStatus = subAdmin.status === "active" ? "disabled" : "active";

  return (
    <tr className="border-b border-zinc-100 dark:border-zinc-900">
      <td className="py-3 pr-4 font-medium">{subAdmin.username}</td>
      <td className="py-3 pr-4">{subAdmin.email}</td>
      <td className="py-3 pr-4">{subAdmin.company_name ?? "—"}</td>
      <td className="py-3 pr-4">
        <span
          className={
            subAdmin.status === "active"
              ? "text-green-600 font-semibold"
              : "text-zinc-400 font-semibold"
          }
        >
          {subAdmin.status}
        </span>
      </td>
      <td className="py-3 pr-4 text-zinc-400">
        {formatDate(subAdmin.created_at)}
      </td>
      <td className="py-3 pr-4">
        <button
          onClick={() => toggleSubAdminStatus(subAdmin.id, nextStatus)}
          className="rounded-lg border border-zinc-300 px-3 py-1 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          {subAdmin.status === "active" ? "Disable" : "Enable"}
        </button>
      </td>
    </tr>
  );
}
