"use client";

import { useState } from "react";
import { supabase } from "@/src/lib/supabase";
import { useRouter } from "next/navigation";

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
        setError("Invalid username or password.");
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

        <form
          onSubmit={handleLogin}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !isLoading) {
              handleLogin(e);
            }
          }}
          className="space-y-4"
        >
          <div>
            <label className="text-xs font-semibold text-[#2D2424] uppercase ml-1">
              Email Address
            </label>
            <input
              type="email"
              required
              name="email"
              autoComplete="email"
              className="mt-1 w-full px-4 py-3 bg-[#FDFCF8] border border-[#EBE3D5] rounded-xl focus:ring-2 focus:ring-[#D2691E] focus:border-transparent outline-none transition-all placeholder:text-gray-400 text-[#2D2424]"
              placeholder="name@coffee.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#2D2424] uppercase ml-1">
              Password
            </label>
            <input
              type="password"
              required
              name="password"
              autoComplete="current-password"
              className="mt-1 w-full px-4 py-3 bg-[#FDFCF8] border border-[#EBE3D5] rounded-xl focus:ring-2 focus:ring-[#D2691E] focus:border-transparent outline-none transition-all placeholder:text-gray-400 text-[#2D2424]"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-[#2D2424] text-[#FDFCF8] font-bold py-3 rounded-xl transform transition-all active:scale-[0.98] shadow-md shadow-orange-900/10 mt-2 flex justify-center items-center ${
              isLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-[#433434]"
            }`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
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
                Brewing...
              </span>
            ) : (
              "Sign In to Dashboard"
            )}
          </button>

          {error && (
            <div className="mt-4 rounded-xl border-l-4 border-red-500 bg-red-50 p-4 text-red-800 text-xs animate-in fade-in slide-in-from-top-1">
              <p className="font-bold">Authentication Error</p>
              <p className="opacity-90">{error}</p>
            </div>
          )}
        </form>

        <p className="text-center text-[10px] text-[#7E6363] mt-8 uppercase tracking-widest font-bold">
          &copy; 2026 Daffarez Elguska.
        </p>
      </div>
    </div>
  );
}
