// Server-side only (uses next/headers); import it from server actions.
import { cookies } from "next/headers";
import { FLASH_COOKIE, type ToastType } from "./toast-types";

/** Queue a toast to show on the next page (use in server actions before a redirect). */
export async function setFlash(message: string, type: ToastType = "success"): Promise<void> {
  // Next.js URL-encodes cookie values itself, so pass the raw JSON.
  (await cookies()).set(FLASH_COOKIE, JSON.stringify({ type, message }), {
    path: "/",
    maxAge: 60,
    sameSite: "lax",
    httpOnly: false, // the client reads and clears it
  });
}
