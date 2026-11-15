"use client";

import { useState } from "react";

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & { className?: string };

/** Password field with an eye button that shows or hides the text. */
export default function PasswordInput({ className = "", ...props }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative mt-1">
      <input {...props} type={visible ? "text" : "password"} className={`${className} pr-10`} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        title={visible ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-md text-slate-500 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-500"
      >
        {visible ? (
          // eye-off
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 5.1A9.8 9.8 0 0112 5c5 0 9 4.5 10 7-.4 1-1.2 2.3-2.4 3.6M6.6 6.6C4.5 8 3 10.1 2 12c1 2.5 5 7 10 7 1.8 0 3.4-.5 4.8-1.3" />
          </svg>
        ) : (
          // eye
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2 12c1-2.5 5-7 10-7s9 4.5 10 7c-1 2.5-5 7-10 7S3 14.5 2 12z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
}
