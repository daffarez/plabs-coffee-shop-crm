"use client";

import { X, AlertCircle, CheckCircle2, Info } from "lucide-react";
import { useToastStore } from "../store/usetoaststore";

export const Toast = () => {
  const { isOpen, message, type, hideToast } = useToastStore();

  if (!isOpen) return null;

  const styles = {
    success: "bg-[#ECFDF5] border-[#10B981] text-[#065F46]",
    error: "bg-[#FFF1F2] border-[#F43F5E] text-[#9F1239]",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };

  const icons = {
    success: <CheckCircle2 className="text-[#10B981]" size={18} />,
    error: <AlertCircle className="text-[#F43F5E]" size={18} />,
    info: <Info className="text-blue-500" size={18} />,
  };

  return (
    <div className="fixed top-10 right-10 z-10000 animate-in fade-in slide-in-from-right-5 duration-300">
      <div
        className={`flex items-center gap-3 px-6 py-4 rounded-2xl border-2 shadow-2xl min-w-[320px] max-w-100 ${styles[type]}`}
      >
        {icons[type]}
        <div className="flex-1">
          <p className="text-xs font-black uppercase tracking-wider opacity-60 mb-0.5">
            {type === "success"
              ? "Success"
              : type === "error"
                ? "Error"
                : "Info"}
          </p>
          <p className="text-sm font-bold leading-tight">{message}</p>
        </div>
        <button
          onClick={hideToast}
          className="p-1 hover:bg-black/5 rounded-lg transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};
