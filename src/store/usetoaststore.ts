import { create } from "zustand";

type ToastType = "success" | "error" | "info";

interface ToastState {
  isOpen: boolean;
  message: string;
  type: ToastType;
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  isOpen: false,
  message: "",
  type: "info",
  showToast: (message, type = "info") => {
    set({ isOpen: true, message, type });
    setTimeout(() => {
      set({ isOpen: false });
    }, 3000);
  },
  hideToast: () => set({ isOpen: false }),
}));
