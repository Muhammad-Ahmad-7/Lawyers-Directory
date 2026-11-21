"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BriefcaseIcon, CalendarIcon } from "./ui";

const LINKS = [
  { href: "/calendar", label: "Calendar", Icon: CalendarIcon },
  { href: "/cases", label: "Cases", Icon: BriefcaseIcon },
];

export default function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1" aria-label="Main">
      {LINKS.map(({ href, label, Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors ${
              active ? "bg-primary/10 text-primary" : "text-slate-600 hover:bg-muted hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
