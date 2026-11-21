import { Logo } from "./ui";

/** Frame for the sign-in and sign-up pages: logo, title and one card. */
export default function AuthShell({
  title,
  lead,
  wide = false,
  children,
  footer,
}: {
  title: string;
  lead: React.ReactNode;
  wide?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-10 sm:py-16">
      <Logo href="/login" />
      <div className={`mt-8 w-full ${wide ? "max-w-lg" : "max-w-sm"}`}>
        <div className="card p-6 sm:p-8">
          <div className="mb-6 space-y-1">
            <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground">{lead}</p>
          </div>
          {children}
        </div>
        {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
      </div>
    </main>
  );
}
