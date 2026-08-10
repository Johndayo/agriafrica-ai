import { useState, useCallback, useRef } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

let toastCounter = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (options: ToastOptions): string => {
      const id = `toast-${++toastCounter}`;
      const toast: Toast = {
        id,
        message: options.message,
        type: options.type ?? "info",
        duration: options.duration ?? 4000,
      };

      setToasts((prev) => [...prev.slice(-4), toast]);

      const timer = setTimeout(() => removeToast(id), toast.duration);
      timersRef.current.set(id, timer);

      return id;
    },
    [removeToast]
  );

  const toast = useCallback(
    (options: ToastOptions) => addToast(options),
    [addToast]
  );

  const success = useCallback(
    (message: string) => addToast({ message, type: "success" }),
    [addToast]
  );

  const error = useCallback(
    (message: string) => addToast({ message, type: "error", duration: 6000 }),
    [addToast]
  );

  const warning = useCallback(
    (message: string) => addToast({ message, type: "warning", duration: 5000 }),
    [addToast]
  );

  return { toasts, toast, success, error, warning, removeToast };
}
