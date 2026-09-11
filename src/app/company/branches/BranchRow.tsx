"use client";

import Link from "next/link";
import { deleteBranch } from "@/app/company/actions";

type Branch = {
  id: number;
  branch_name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  employee_count: number;
};

export default function BranchRow({ branch }: { branch: Branch }) {
  function handleDelete() {
    const message =
      branch.employee_count > 0
        ? `${branch.employee_count} employee(s) are assigned to this branch. Deleting it will unassign them, not delete them. Continue?`
        : "Delete this branch?";
    if (confirm(message)) {
      deleteBranch(branch.id);
    }
  }

  return (
    <tr className="border-b border-zinc-100 dark:border-zinc-900">
      <td className="py-3 pr-4 font-medium">{branch.branch_name}</td>
      <td className="py-3 pr-4">{branch.address ?? "—"}</td>
      <td className="py-3 pr-4">
        {[branch.city, branch.state].filter(Boolean).join(", ") || "—"}
      </td>
      <td className="py-3 pr-4">{branch.employee_count}</td>
      <td className="py-3 pr-4">
        <div className="flex gap-2">
          <Link
            href={`/company/branches/${branch.id}/edit`}
            className="rounded-lg border border-zinc-300 px-3 py-1 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="rounded-lg border border-red-300 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
