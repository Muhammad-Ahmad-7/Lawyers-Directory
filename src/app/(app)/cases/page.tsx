import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { requireUserId } from "@/auth";
import { prisma } from "@/lib/db";
import { appTimeZone, dbDateToKey, formatKey, formatTime, keyToDbDate, todayKey } from "@/lib/dates";
import { CASE_STATUSES, CASE_STATUS_META, CASE_TYPE_LABEL, type CaseStatusKey } from "@/lib/case-meta";
import { BriefcaseIcon, CaseStatusBadge, PageHeader, PlusIcon, SearchIcon } from "@/components/ui";

type Filter = "all" | CaseStatusKey;
const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  ...CASE_STATUSES.map((s) => ({ key: s as Filter, label: CASE_STATUS_META[s].label })),
];

export default async function CasesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const userId = await requireUserId();
  const params = await searchParams;
  const q = (params.q ?? "").trim().slice(0, 100);
  const status: Filter = CASE_STATUSES.includes(params.status as CaseStatusKey) ? (params.status as CaseStatusKey) : "all";
  const today = todayKey(appTimeZone());

  const where: Prisma.CaseWhereInput = {
    lawyerId: userId,
    ...(status !== "all" ? { status } : {}),
    ...(q
      ? {
          OR: (["title", "caseNumber", "courtName", "clientName", "opposingParty"] as const).map((f) => ({
            [f]: { contains: q, mode: "insensitive" as const },
          })),
        }
      : {}),
  };

  const rows = await prisma.case.findMany({
    where,
    include: {
      // The next hearing from today on.
      hearings: {
        where: { hearingDate: { gte: keyToDbDate(today) }, status: { not: "CANCELLED" } },
        orderBy: [{ hearingDate: "asc" }, { hearingTime: { sort: "asc", nulls: "last" } }],
        take: 1,
      },
      _count: { select: { hearings: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Cases with an upcoming hearing first (soonest on top), then the rest by last update.
  const cases = rows
    .map((c) => ({ ...c, next: c.hearings[0] ? { date: dbDateToKey(c.hearings[0].hearingDate), time: c.hearings[0].hearingTime } : null }))
    .sort((a, b) => {
      if (a.next && b.next) return (a.next.date + (a.next.time ?? "99")).localeCompare(b.next.date + (b.next.time ?? "99"));
      if (a.next) return -1;
      if (b.next) return 1;
      return 0;
    });

  const filterHref = (f: Filter) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (f !== "all") sp.set("status", f);
    const s = sp.toString();
    return s ? `/cases?${s}` : "/cases";
  };

  const nextLabel = (n: { date: string; time: string | null } | null) => {
    if (!n) return <span className="text-muted-foreground">—</span>;
    const isToday = n.date === today;
    return (
      <span className={isToday ? "font-medium text-primary" : ""}>
        {isToday ? "Today" : formatKey(n.date, "EEE, d MMM yyyy")}
        {n.time && <span className="text-muted-foreground"> · {formatTime(n.time)}</span>}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cases"
        description="All your cases and their next hearing dates."
        actions={
          <Link href="/cases/new" className="btn-primary">
            <PlusIcon /> New case
          </Link>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1" role="tablist" aria-label="Filter by status">
          {FILTERS.map((f) => (
            <Link
              key={f.key}
              href={filterHref(f.key)}
              role="tab"
              aria-selected={status === f.key}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                status === f.key ? "bg-card text-foreground shadow-sm" : "text-slate-600 hover:text-foreground"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>
        <form action="/cases" className="relative w-full sm:w-72">
          {status !== "all" && <input type="hidden" name="status" value={status} />}
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search title, number, court, client…"
            aria-label="Search cases"
            className="field pl-9"
          />
        </form>
      </div>

      {cases.length === 0 ? (
        <div className="card flex flex-col items-center px-6 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <BriefcaseIcon className="h-6 w-6" />
          </span>
          {q || status !== "all" ? (
            <>
              <h2 className="mt-4 font-semibold">No matching cases</h2>
              <p className="mt-1 text-sm text-muted-foreground">Try a different search or filter.</p>
              <Link href="/cases" className="btn-secondary mt-5">
                Clear filters
              </Link>
            </>
          ) : (
            <>
              <h2 className="mt-4 font-semibold">No cases yet</h2>
              <p className="mt-1 text-sm text-muted-foreground">Add your first case and set its hearing date.</p>
              <Link href="/cases/new" className="btn-primary mt-5">
                <PlusIcon /> New case
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="card overflow-hidden">
          {/* Desktop table */}
          <table className="hidden w-full text-sm md:table">
            <thead className="border-b border-border bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Case</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Court</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Next hearing</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {cases.map((c) => (
                <tr key={c.id} className="group relative transition-colors hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/cases/${c.id}`} className="font-medium text-foreground after:absolute after:inset-0 group-hover:text-primary">
                      {c.title}
                    </Link>
                    <div className="text-xs text-muted-foreground">
                      {c.caseNumber ?? "No case number"} · {c._count.hearings} {c._count.hearings === 1 ? "hearing" : "hearings"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{CASE_TYPE_LABEL[c.caseType]}</td>
                  <td className="px-4 py-3 text-slate-600">{c.courtName ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{c.clientName ?? "—"}</td>
                  <td className="px-4 py-3">{nextLabel(c.next)}</td>
                  <td className="px-4 py-3">
                    <CaseStatusBadge status={c.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile list */}
          <ul className="divide-y divide-border md:hidden">
            {cases.map((c) => (
              <li key={c.id}>
                <Link href={`/cases/${c.id}`} className="block px-4 py-3 hover:bg-slate-50">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium">{c.title}</span>
                    <CaseStatusBadge status={c.status} />
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {[CASE_TYPE_LABEL[c.caseType], c.caseNumber, c.courtName].filter(Boolean).join(" · ")}
                  </div>
                  <div className="mt-1 text-sm">
                    <span className="text-muted-foreground">Next: </span>
                    {nextLabel(c.next)}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
