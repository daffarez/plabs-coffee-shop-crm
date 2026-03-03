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
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Invalid username or password.");
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="space-y-4 w-80">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Mimi Coffee Shop</h1>
          <p className="text-sm text-gray-500 mt-2">CRM Dashboard</p>
        </div>
        <input
          className="border p-2 w-full"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="border p-2 w-full"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleLogin}
          className="bg-black text-white p-2 w-full"
        >
          Login
        </button>
        {error && (
          <div className="mb-4 rounded-md border border-red-300 bg-red-100 px-4 py-3 text-red-700 text-sm transition-opacity">
            <strong className="font-semibold block">Login Failed</strong>
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
