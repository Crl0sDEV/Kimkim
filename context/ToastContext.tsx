"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

// Types
type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Function to add toast
  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  // Function to manually remove
  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* --- TOAST CONTAINER (Fixed on Top Center) --- */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-9999 flex flex-col items-center gap-2 pointer-events-none w-full max-w-sm px-4">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl backdrop-blur-md border shadow-lg w-full ${
                toast.type === "error"
                  ? "bg-red-950/60 border-red-500/30 text-red-200"
                  : toast.type === "success"
                  ? "bg-sky-950/60 border-sky-500/30 text-sky-200"
                  : "bg-slate-900/60 border-slate-700/50 text-slate-200"
              }`}
            >
              {/* ICON */}
              <div className="shrink-0">
                {toast.type === "error" ? (
                  <AlertCircle size={18} className="text-red-400" />
                ) : (
                  <CheckCircle2 size={18} className="text-sky-400" />
                )}
              </div>

              {/* MESSAGE */}
              <p className="text-sm font-medium tracking-wide flex-1">
                {toast.message}
              </p>

              {/* CLOSE BUTTON */}
              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

// Custom Hook para madaling gamitin
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}