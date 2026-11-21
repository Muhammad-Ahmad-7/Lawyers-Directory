import { auth, signOut } from "@/auth";
import { setFlash } from "@/lib/flash";
import AppNav from "@/components/AppNav";
import { Logo } from "@/components/ui";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const name = session?.user?.name ?? "";
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur print:hidden">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Logo href="/calendar" />
            <div className="hidden sm:block">
              <AppNav />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 md:flex">
              <span
                aria-hidden="true"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700"
              >
                {initials}
              </span>
              <span className="text-sm text-slate-700">{name}</span>
            </div>
            <form
              action={async () => {
                "use server";
                await setFlash("You've been signed out.", "info");
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button type="submit" className="btn-secondary h-8 px-3">
                Log out
              </button>
            </form>
          </div>
        </div>
        <div className="border-t border-border px-4 py-2 sm:hidden">
          <AppNav />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 print:max-w-none print:p-0">{children}</main>
    </div>
  );
}
