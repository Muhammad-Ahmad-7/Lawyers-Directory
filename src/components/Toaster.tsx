"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { FLASH_COOKIE, type ToastType } from "@/lib/toast-types";

type Toast = { id: number; type: ToastType; message: string };
type ToastFn = (message: string, type?: ToastType) => void;

const ToastContext = createContext<ToastFn>(() => {});

/** Show a toast: `const toast = useToast(); toast("Saved", "success")`. */
export function useToast(): ToastFn {
  return useContext(ToastContext);
}

const DURATION_MS = 4000;

const STYLES: Record<ToastType, { icon: React.ReactNode }> = {
  success: {
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-green-600" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.86-9.86a.75.75 0 0 0-1.22-.88l-3.24 4.5-1.62-1.62a.75.75 0 1 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.09l3.75-5.22Z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  error: {
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-red-600" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  info: {
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-muted-foreground" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.25v3.25a.75.75 0 0 0 1.5 0V9.75A.75.75 0 0 0 10 9H9Z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
};

function readFlashCookie(): { type: ToastType; message: string } | null {
  const raw = document.cookie.split("; ").find((c) => c.startsWith(`${FLASH_COOKIE}=`));
  if (!raw) return null;
  document.cookie = `${FLASH_COOKIE}=; Max-Age=0; path=/`;
  // Decode until it parses as JSON (tolerates the value being URL-encoded once or twice).
  let value = raw.slice(FLASH_COOKIE.length + 1);
  for (let i = 0; i < 3; i++) {
    try {
      value = decodeURIComponent(value);
      const parsed = JSON.parse(value);
      if (typeof parsed?.message === "string") {
        const type: ToastType = ["success", "error", "info"].includes(parsed.type) ? parsed.type : "info";
        return { type, message: parsed.message };
      }
      return null;
    } catch {
      // not JSON yet, so decode again
    }
  }
  return null;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);
  const pathname = usePathname();

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback<ToastFn>(
    (message, type = "success") => {
      const id = nextId.current++;
      setToasts((list) => [...list.slice(-3), { id, type, message }]);
      window.setTimeout(() => dismiss(id), DURATION_MS);
    },
    [dismiss],
  );

  // Messages set by the server before a redirect (sign in, sign up, sign out).
  useEffect(() => {
    const flash = readFlashCookie();
    if (flash) toast(flash.message, flash.type);
  }, [pathname, toast]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex flex-col items-center gap-2 p-4 sm:items-end print:hidden"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.type === "error" ? "alert" : "status"}
            className="toast-in pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border border-border bg-card p-3 text-foreground shadow-lg"
          >
            <span className="mt-0.5 shrink-0">{STYLES[t.type].icon}</span>
            <p className="flex-1 text-sm">{t.message}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="-m-1 rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
