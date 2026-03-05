"use client";

import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase";
import {
  Users,
  Sparkles,
  LogOut,
  Coffee,
  UserCircle,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLoadingStore } from "../store/useloadingstore";
import { ConfirmModal } from "./confirmmodal";

export const TopNav = () => {
  const [userEmail, setUserEmail] = useState<string>("User");
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const { startLoading, stopLoading } = useLoadingStore();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isMobileOpen]);

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
    setIsLogoutModalOpen(false);
    startLoading("Logging out from Kopi Kita...");

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      router.push("/login");
      router.refresh();
    } catch (err) {
    } finally {
      stopLoading();
    }
  };

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", label: "Dashboard", icon: Coffee },
    { name: "Customers", href: "/customers", icon: Users },
    { name: "AI Promo", href: "/promo-ideas", icon: Sparkles },
  ];

  return (
    <>
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
              className="md:hidden"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
            >
              {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <button
              onClick={() => setIsLogoutModalOpen(true)}
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

      {isMobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsMobileOpen(false)}
          />

          <div className="absolute top-16 left-0 right-0 bg-white shadow-xl border-t border-[#EBE3D5] animate-in slide-in-from-top-2 duration-200">
            <div className="px-6 py-6 space-y-5">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`block text-base font-bold ${
                      isActive ? "text-[#D2691E]" : "text-[#7E6363]"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        title="Log out"
        description="Are you sure you want to end this session? You need to log in again to access the Kopi Kita dashboard."
        confirmText="Log out"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
};
