"use client";

import { useState } from "react";
import { supabase } from "@/src/lib/supabase";
import { useRouter } from "next/navigation";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async () => {
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Invalid username or password.");
      return;
    }

    router.refresh();

    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFCF8]">
      <div className="w-full max-w-sm p-8 bg-white rounded-2xl shadow-sm border border-[#EBE3D5]">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-extrabold text-[#2D2424] tracking-tight">
            Kopi Kita
          </h1>
          <p className="text-sm font-medium text-[#7E6363] mt-1 uppercase tracking-widest">
            CRM Dashboard
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#2D2424] uppercase ml-1">
              Email Address
            </label>
            <input
              className="mt-1 w-full px-4 py-3 bg-[#FDFCF8] border border-[#EBE3D5] rounded-xl focus:ring-2 focus:ring-[#D2691E] focus:border-transparent outline-none transition-all placeholder:text-gray-400"
              placeholder="name@coffee.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#2D2424] uppercase ml-1">
              Password
            </label>
            <input
              type="password"
              className="mt-1 w-full px-4 py-3 bg-[#FDFCF8] border border-[#EBE3D5] rounded-xl focus:ring-2 focus:ring-[#D2691E] focus:border-transparent outline-none transition-all placeholder:text-gray-400"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            onClick={handleLogin}
            className="w-full bg-[#2D2424] text-[#FDFCF8] font-bold py-3 rounded-xl hover:bg-[#433434] transform transition-active active:scale-[0.98] shadow-md shadow-brown-900/20 mt-2"
          >
            Sign In to Dashboard
          </button>

          {error && (
            <div className="mt-4 rounded-xl border-l-4 border-red-500 bg-red-50 p-4 text-red-800 text-xs animate-in fade-in slide-in-from-top-1">
              <p className="font-bold">Authentication Error</p>
              <p className="opacity-90">{error}</p>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-[#7E6363] mt-8">
          &copy; 2026 Daffarez Elguska.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
