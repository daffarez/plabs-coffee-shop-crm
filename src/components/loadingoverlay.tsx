"use client";

import { Loader2, Coffee } from "lucide-react";
import { useLoadingStore } from "../store/useloadingstore";

export const LoadingOverlay = () => {
  const { isLoading, message } = useLoadingStore();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-[#FDFCF8]/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative flex flex-col items-center">
        <div className="w-20 h-20 bg-[#2D2424] rounded-3xl flex items-center justify-center shadow-2xl shadow-orange-900/20 mb-4 animate-bounce">
          <Coffee className="text-[#D2691E]" size={40} />
        </div>

        <Loader2 className="animate-spin text-[#D2691E] mb-2" size={24} />

        <p className="text-sm font-bold text-[#2D2424] tracking-tight uppercase">
          {message}
        </p>
      </div>
    </div>
  );
};
