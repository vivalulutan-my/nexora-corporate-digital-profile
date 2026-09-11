"use client";

import { useState } from "react";

export default function DashboardShell({
  title,
  subtitle,
  nav,
  children,
}: {
  title: string;
  subtitle: string;
  nav: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <div className="fixed inset-x-0 top-0 z-30 flex items-center justify-between bg-blue-950 px-4 py-3 text-white md:hidden">
        <span className="text-lg font-bold">{title}</span>
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="rounded-lg p-1 text-2xl leading-none hover:bg-blue-900"
        >
          &#9776;
        </button>
      </div>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 shrink-0 overflow-y-auto bg-blue-950 px-6 py-8 text-white transition-transform duration-200 md:static md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="mt-1 text-xs text-blue-300">{subtitle}</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="rounded-lg p-1 text-xl leading-none hover:bg-blue-900 md:hidden"
          >
            &#10005;
          </button>
        </div>

        <nav
          onClick={() => setOpen(false)}
          className="mt-10 flex flex-col gap-1"
        >
          {nav}
        </nav>
      </aside>

      <main className="flex-1 bg-zinc-50 px-6 py-8 pt-20 md:px-10 md:pt-8 dark:bg-zinc-900">
        {children}
      </main>
    </div>
  );
}
