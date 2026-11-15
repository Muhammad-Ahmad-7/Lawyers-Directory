import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/Toaster";

export const metadata: Metadata = {
  title: "Lawyer Schedule",
  description: "Monthly schedule of appointments, court hearings and deadlines",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
