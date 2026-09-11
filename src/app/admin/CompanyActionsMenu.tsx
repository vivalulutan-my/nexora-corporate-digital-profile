"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleOpen() {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({ top: rect.bottom + window.scrollY, left: rect.right + window.scrollX });
    }
    setOpen((v) => !v);
  }

  const isSuspended = status === "suspend";

  return (
    <>
      <button
        ref={buttonRef}
        onClick={toggleOpen}
        className="rounded-lg bg-blue-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-800"
      >
        Actions ▾
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: "absolute",
              top: coords.top + 4,
              left: coords.left - 176,
            }}
            className="z-50 w-44 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
          >
            <Link
              href={`/admin/companies/${companyId}/admins`}
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Manage Admin
            </Link>
            <Link
              href={`/admin/companies/${companyId}/license`}
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Manage License
            </Link>
            <Link
              href={`/admin/companies/${companyId}/employees`}
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              View Employees
            </Link>
            <button
              onClick={() => {
                setOpen(false);
                toggleCompanyStatus(companyId, isSuspended ? "active" : "suspend");
              }}
              className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              {isSuspended ? "Reactivate Company" : "Suspend Company"}
            </button>
          </div>,
          document.body
        )}
    </>
  );
}
