import { useEffect, useRef } from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

interface ToastProps {
  message: string;
  tone?: "error" | "success";
  onClose: () => void;
  /** مدة الإخفاء التلقائي بالـ ms، مرر 0 لتعطيله */
  duration?: number;
}

export function Toast({ message, tone = "error", onClose, duration = 5000 }: ToastProps) {
  // نحفظ onClose في ref حتى لا يُعاد ضبط المؤقت كل مرة
  // يُعاد فيها رسم الأب (وإلا لن يختفي الـ toast نهائياً)
  const savedOnClose = useRef(onClose);

  useEffect(() => {
    savedOnClose.current = onClose;
  });

  useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(() => savedOnClose.current(), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  const isError = tone === "error";

  return (
    <div
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-70 flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl bg-gray-900 border border-gray-700 min-w-75 max-w-[calc(100vw-2rem)]"
    >
      {isError ? (
        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
      ) : (
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
      )}
      <span className="text-sm text-gray-100 flex-1">{message}</span>
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={onClose}
        className="text-gray-500 hover:text-gray-300 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
