import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import LogoutButton from "@/components/LogoutButton";
import DashboardShell from "@/components/DashboardShell";

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
    <DashboardShell
      title="Nexora"
      subtitle="super_admin"
      nav={
        <>
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
        </>
      }
    >
      {children}
    </DashboardShell>
  );
}
