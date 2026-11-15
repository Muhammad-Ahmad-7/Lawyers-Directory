import { auth, signOut } from "@/auth";
import { setFlash } from "@/lib/flash";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white print:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <span className="font-semibold">Lawyer Schedule</span>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-slate-600 sm:inline">{session?.user?.name}</span>
            <form
              action={async () => {
                "use server";
                await setFlash("You've been signed out.", "info");
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button
                type="submit"
                className="rounded-md border border-slate-300 px-3 py-1.5 hover:bg-slate-100"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-4">{children}</main>
    </div>
  );
}
