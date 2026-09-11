import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import LogoutButton from "@/components/LogoutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== "super_admin") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 shrink-0 bg-blue-950 px-6 py-8 text-white">
        <h1 className="text-2xl font-bold">Nexora</h1>
        <p className="mt-1 text-xs text-blue-300">super_admin</p>

        <nav className="mt-10 flex flex-col gap-1">
          <Link
            href="/admin"
            className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-blue-900"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/companies/create"
            className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-blue-900"
          >
            Create Company
          </Link>
          <Link
            href="/admin/subadmins"
            className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-blue-900"
          >
            Create sub Admin
          </Link>
          <LogoutButton />
        </nav>
      </aside>

      <main className="flex-1 bg-zinc-50 px-10 py-8 dark:bg-zinc-900">
        {children}
      </main>
    </div>
  );
}
