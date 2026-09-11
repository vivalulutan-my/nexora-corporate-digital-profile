"use client";

import { toggleEmployeeStatus } from "@/app/company/actions";

export default function EmployeeRow({
  id,
  status,
}: {
  id: number;
  status: string;
}) {
  const nextStatus = status === "active" ? "inactive" : "active";

  return (
    <button
      onClick={() => toggleEmployeeStatus(id, nextStatus)}
      className="rounded-lg border border-zinc-300 px-3 py-1 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
    >
      {status === "active" ? "Deactivate" : "Activate"}
    </button>
  );
}
