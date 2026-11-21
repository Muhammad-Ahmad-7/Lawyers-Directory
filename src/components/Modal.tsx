"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { XIcon } from "./ui";

/**
 * Dialog rendered into <body>. Escape and a click on the backdrop call onClose,
 * unless `onEscape` returns true (used to back out of a nested confirmation first).
 */
export default function Modal({
  title,
  onClose,
  onEscape,
  children,
}: {
  title: string;
  onClose: () => void;
  onEscape?: () => boolean;
  children: React.ReactNode;
}) {
  const escRef = useRef(onEscape);
  escRef.current = onEscape;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (escRef.current?.()) return;
      onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 sm:items-center sm:p-4 print:hidden"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-xl border border-border bg-card shadow-xl sm:rounded-xl"
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 id="modal-title" className="text-base font-semibold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <XIcon />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
