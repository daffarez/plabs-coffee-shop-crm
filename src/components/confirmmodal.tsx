import { AlertCircle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning";
}

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Yes",
  cancelText = "Cancel",
  variant = "danger",
}: ConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-[#EBE3D5] animate-in zoom-in-95 duration-200">
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto ${
            variant === "danger" ? "bg-red-50" : "bg-orange-50"
          }`}
        >
          <AlertCircle
            size={32}
            className={
              variant === "danger" ? "text-red-500" : "text-orange-500"
            }
          />
        </div>

        <h3 className="text-xl font-bold text-[#2D2424] text-center mb-2">
          {title}
        </h3>
        <p className="text-sm text-[#7E6363] text-center mb-8 leading-relaxed">
          {description}
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            className={`w-full py-4 text-white rounded-2xl font-bold transition-all active:scale-95 ${
              variant === "danger"
                ? "bg-red-500 hover:bg-red-600"
                : "bg-[#D2691E] hover:bg-[#b55a1a]"
            }`}
          >
            {confirmText}
          </button>
          <button
            onClick={onClose}
            className="w-full py-4 bg-[#FDFCF8] text-[#7E6363] rounded-2xl font-bold border border-[#EBE3D5] hover:bg-white transition-all"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};
