"use client";

import { useRouter } from "next/navigation";
import { logout } from "@/app/actions";

export default function LogoutButton() {
  const router = useRouter();

  return (
    <button
      onClick={async () => {
        await logout();
        router.push("/");
      }}
      className="mt-4 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-200 hover:bg-blue-900"
    >
      Logout
    </button>
  );
}
