"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase";
import { LayoutDashboard, Users, Sparkles, LogOut, Coffee } from "lucide-react";

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Customers", href: "/dashboard/customers", icon: Users },
    { name: "Promo Ideas", href: "/dashboard/promo-ideas", icon: Sparkles },
  ];

  return (
    <div className="min-h-screen flex bg-[#FDFCF8]">
      <aside className="w-64 bg-[#2D2424] text-[#FDFCF8] flex flex-col border-r border-[#3E3232]">
        <div className="p-8 mb-4 flex items-center gap-3">
          <div className="bg-[#D2691E] p-2 rounded-lg shadow-lg shadow-orange-950/20">
            <Coffee size={20} className="text-white" />
          </div>
          <div>
            <h2 className="font-extrabold text-lg leading-none tracking-tight">
              Mimi's <span className="text-[#D2691E]">Kopi Kita</span>
            </h2>
            <p className="text-[10px] text-[#7E6363] font-bold uppercase tracking-widest mt-1">
              CRM
            </p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group
                  ${
                    isActive
                      ? "bg-[#D2691E] text-white shadow-md shadow-orange-950/40"
                      : "text-[#7E6363] hover:bg-[#3E3232] hover:text-[#FDFCF8]"
                  }`}
              >
                <item.icon
                  size={18}
                  className={`${isActive ? "text-white" : "group-hover:text-[#D2691E] transition-colors"}`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#3E3232] mt-auto">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-[#7E6363] hover:text-red-400 hover:bg-red-950/20 rounded-xl transition-all group"
          >
            <LogOut
              size={18}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="p-8 mx-auto">{children}</div>
      </main>
    </div>
  );
};

export default ProtectedLayout;
