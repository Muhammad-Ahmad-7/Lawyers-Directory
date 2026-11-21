import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUserId } from "@/auth";
import { prisma } from "@/lib/db";
import { appTimeZone, formatKey, formatTime, todayKey } from "@/lib/dates";
import { CASE_TYPE_LABEL } from "@/lib/case-meta";
import { hearingOrder, toHearingDTO } from "@/lib/hearing-dto";
import CaseHearings from "@/components/CaseHearings";
import DeleteCaseButton from "@/components/DeleteCaseButton";
import { ArrowLeftIcon, CaseStatusBadge } from "@/components/ui";

export default async function CasePage({ params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  const { id } = await params;
  const c = await prisma.case.findFirst({
    where: { id, lawyerId: userId },
    include: { hearings: { orderBy: hearingOrder } },
  });
  if (!c) notFound();

  const today = todayKey(appTimeZone());
  const hearings = c.hearings.map(toHearingDTO);
  const next = hearings.find((h) => h.date >= today && h.status !== "CANCELLED");

  const details: [string, React.ReactNode][] = [
    ["Case type", CASE_TYPE_LABEL[c.caseType]],
    ["Case number", c.caseNumber],
    ["Court", c.courtName],
    ["Client", c.clientName],
    [
      "Client phone",
      c.clientPhone && (
        <a href={`tel:${c.clientPhone}`} className="text-primary hover:underline">
          {c.clientPhone}
        </a>
      ),
    ],
    ["Opposing party", c.opposingParty],
  ];

  return (
    <div className="space-y-6">
      <Link href="/cases" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeftIcon /> Back to cases
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{c.title}</h1>
            <CaseStatusBadge status={c.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {[CASE_TYPE_LABEL[c.caseType], c.caseNumber, c.courtName].filter(Boolean).join(" · ")}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/cases/${c.id}/edit`} className="btn-secondary">
            Edit
          </Link>
          <DeleteCaseButton id={c.id} title={c.title} hearingCount={hearings.length} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="order-2 lg:order-1">
          <CaseHearings caseId={c.id} hearings={hearings} today={today} />
        </div>

        <aside className="order-1 space-y-6 lg:order-2">
          <section className="card border-primary/20 bg-primary/[0.03] p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-primary">Next hearing</h2>
            {next ? (
              <>
                <p className="mt-2 text-lg font-semibold">
                  {next.date === today ? "Today" : formatKey(next.date, "EEEE, d MMMM yyyy")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {[next.time ? formatTime(next.time) : "Time not set", next.purpose].filter(Boolean).join(" · ")}
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">No upcoming hearing scheduled.</p>
            )}
          </section>

          <section className="card p-5">
            <h2 className="text-sm font-semibold">Case details</h2>
            <dl className="mt-3 space-y-3 text-sm">
              {details.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="mt-0.5">{value || <span className="text-slate-400">—</span>}</dd>
                </div>
              ))}
            </dl>
            {c.notes && (
              <div className="mt-4 border-t border-border pt-4">
                <h3 className="text-xs text-muted-foreground">Notes</h3>
                <p className="mt-1 whitespace-pre-line text-sm">{c.notes}</p>
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
