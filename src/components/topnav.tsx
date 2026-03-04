"use client";

import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase";
import { Users, Sparkles, LogOut, Coffee, UserCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export const TopNav = () => {
  const [userEmail, setUserEmail] = useState<string>("User");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user?.email) {
      setUserEmail(user.email);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", label: "Dashboard", icon: Coffee },
    { name: "Customers", href: "/customers", icon: Users },
    { name: "AI Promo", href: "/promo-ideas", icon: Sparkles },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#EBE3D5]">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <span className="font-black text-xl tracking-tighter text-[#2D2424] group-hover:text-[#D2691E] transition-colors">
            Kopi Kita
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1 bg-[#FDFCF8] p-1.5 rounded-2xl border border-[#EBE3D5]">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? "bg-[#2D2424] text-white shadow-md"
                    : "text-[#7E6363] hover:text-[#2D2424] hover:bg-white"
                }`}
              >
                <item.icon size={16} />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#FDFCF8] border border-[#EBE3D5] rounded-full">
            <UserCircle size={18} className="text-[#D2691E]" />
            <span className="text-xs font-bold text-[#7E6363] max-w-37.5 truncate">
              {userEmail}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-red-500 hover:bg-red-50 transition-all text-sm group border border-transparent hover:border-red-100"
          >
            <LogOut
              size={18}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
