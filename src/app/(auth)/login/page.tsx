"use client";

import { useState } from "react";
import { supabase } from "@/src/lib/supabase";
import { useRouter } from "next/navigation";
import { Coffee, Lock, Mail } from "lucide-react"; // Tambahkan icon agar lebih premium

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword(
        {
          email,
          password,
        },
      );

      if (authError) {
        setError("Invalid email or password.");
        setIsLoading(false);
        return;
      }

      router.refresh();
      setTimeout(() => {
        router.push("/dashboard");
      }, 300);
    } catch (err) {
      setError("An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFCF8] p-4 md:p-6">
      <div className="w-full max-w-sm bg-white rounded-4xl shadow-xl shadow-orange-900/5 border border-[#EBE3D5] overflow-hidden">
        <div className="p-8 md:p-10">
          <div className="text-center mb-10">
            <h1 className="text-2xl font-extrabold text-[#2D2424] tracking-tight">
              Kopi Kita
            </h1>
            <p className="text-[10px] font-bold text-[#7E6363] mt-1 uppercase tracking-[0.2em]">
              CRM Dashboard System
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#2D2424] uppercase tracking-wider ml-1">
                Email Address
              </label>
              <div className="relative group">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7E6363] group-focus-within:text-[#D2691E] transition-colors"
                  size={18}
                />
                <input
                  type="email"
                  required
                  name="email"
                  autoComplete="email"
                  className="w-full pl-12 pr-4 py-3.5 bg-[#FDFCF8] border border-[#EBE3D5] rounded-2xl focus:ring-4 focus:ring-[#D2691E]/10 focus:border-[#D2691E] outline-none transition-all text-base md:text-sm text-[#2D2424] placeholder:text-gray-300"
                  placeholder="name@coffee.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#2D2424] uppercase tracking-wider ml-1">
                Password
              </label>
              <div className="relative group">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7E6363] group-focus-within:text-[#D2691E] transition-colors"
                  size={18}
                />
                <input
                  type="password"
                  required
                  name="password"
                  autoComplete="current-password"
                  className="w-full pl-12 pr-4 py-3.5 bg-[#FDFCF8] border border-[#EBE3D5] rounded-2xl focus:ring-4 focus:ring-[#D2691E]/10 focus:border-[#D2691E] outline-none transition-all text-base md:text-sm text-[#2D2424] placeholder:text-gray-300"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-[#2D2424] text-[#FDFCF8] font-bold py-4 rounded-2xl transform transition-all active:scale-[0.97] shadow-lg shadow-black/10 mt-4 flex justify-center items-center gap-3 ${
                isLoading
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:bg-[#433434] hover:-translate-y-0.5"
              }`}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-[#D2691E]"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Brewing...</span>
                </>
              ) : (
                "Sign In to Dashboard"
              )}
            </button>

            {error && (
              <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4 text-red-800 text-xs animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                  <p className="font-bold">Authentication Error</p>
                </div>
                <p className="opacity-90 ml-3.5">{error}</p>
              </div>
            )}
          </form>

          <div className="mt-10 pt-6 border-t border-dashed border-[#EBE3D5] text-center">
            <p className="text-[9px] text-[#7E6363] uppercase tracking-[0.25em] font-bold opacity-60">
              &copy; 2026 Daffarez Elguska
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
