"use client";

import Link from "next/link";
import { supabase } from "@/src/lib/supabase";
import { useRouter } from "next/navigation";

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 bg-gray-100 p-6 space-y-4">
        <h2 className="font-bold text-lg">PLABS Coffee Shop CRM</h2>

        <nav className="flex flex-col gap-2">
          <Link href="/dashboard" className="hover:underline">
            Dashboard
          </Link>
          <Link href="/dashboard/customers" className="hover:underline">
            Customers
          </Link>
        </nav>

        <button onClick={logout} className="text-red-500 text-sm mt-6">
          Logout
        </button>
      </aside>

      <main className="flex-1">{children}</main>
    </div>
  );
};

export default ProtectedLayout;
