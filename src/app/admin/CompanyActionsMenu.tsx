"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toggleCompanyStatus } from "./actions";

export default function CompanyActionsMenu({
  companyId,
  status,
}: {
  companyId: number;
  status: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isSuspended = status === "suspend";

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg bg-blue-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-800"
      >
        Actions ▾
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-1 w-44 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
          <Link
            href={`/admin/companies/${companyId}/admins`}
            className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Manage Admin
          </Link>
          <Link
            href={`/admin/companies/${companyId}/license`}
            className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Manage License
          </Link>
          <Link
            href={`/admin/companies/${companyId}/employees`}
            className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            View Employees
          </Link>
          <button
            onClick={() =>
              toggleCompanyStatus(companyId, isSuspended ? "active" : "suspend")
            }
            className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            {isSuspended ? "Reactivate Company" : "Suspend Company"}
          </button>
        </div>
      )}
    </div>
  );
}
