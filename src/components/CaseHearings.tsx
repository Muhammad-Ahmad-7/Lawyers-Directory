"use client";

import { useCallback, useState } from "react";
import type { HearingDTO } from "@/lib/case-meta";
import { formatKey, formatTime } from "@/lib/dates";
import HearingFormModal from "./HearingFormModal";
import { CalendarIcon, HearingStatusBadge, PlusIcon } from "./ui";

type ModalState = { hearing?: HearingDTO } | null;

/** The hearings section of a case page: upcoming and past, with add / edit / delete. */
export default function CaseHearings({
  caseId,
  hearings,
  today,
}: {
  caseId: string;
  hearings: HearingDTO[];
  today: string;
}) {
  const [modal, setModal] = useState<ModalState>(null);
  const close = useCallback(() => setModal(null), []);

  const upcoming = hearings.filter((h) => h.date >= today);
  const past = hearings.filter((h) => h.date < today).reverse();

  const table = (rows: HearingDTO[]) => (
    <ul className="divide-y divide-border">
      {rows.map((h) => (
        <li key={h.id}>
          <button
            type="button"
            onClick={() => setModal({ hearing: h })}
            className="grid w-full grid-cols-[auto_1fr_auto] items-start gap-4 px-4 py-3 text-left transition-colors hover:bg-slate-50 sm:px-6"
          >
            <span className="w-14 rounded-md border border-border bg-card text-center leading-tight shadow-sm">
              <span className="block rounded-t-md bg-primary/10 py-0.5 text-[10px] font-semibold uppercase text-primary">
                {formatKey(h.date, "MMM")}
              </span>
              <span className="block py-1 text-lg font-semibold">{formatKey(h.date, "d")}</span>
            </span>
            <span className="min-w-0">
              <span className={`block text-sm font-medium ${h.status === "CANCELLED" ? "text-slate-400 line-through" : ""}`}>
                {formatKey(h.date, "EEEE, d MMMM yyyy")}
                {h.date === today && <span className="ml-2 text-xs font-semibold text-primary">Today</span>}
              </span>
              <span className="block text-sm text-muted-foreground">
                {[h.time ? formatTime(h.time) : "Time not set", h.purpose].filter(Boolean).join(" · ")}
              </span>
              {h.notes && <span className="mt-1 block whitespace-pre-line text-sm text-slate-600">{h.notes}</span>}
            </span>
            <HearingStatusBadge status={h.status} />
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <section className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-4 sm:px-6">
        <div>
          <h2 className="text-base font-semibold">Hearings</h2>
          <p className="text-sm text-muted-foreground">
            {hearings.length} {hearings.length === 1 ? "hearing" : "hearings"} recorded
          </p>
        </div>
        <button type="button" onClick={() => setModal({})} className="btn-primary">
          <PlusIcon /> Add hearing
        </button>
      </div>

      {hearings.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-12 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <CalendarIcon className="h-5 w-5" />
          </span>
          <p className="mt-3 text-sm font-medium">No hearings yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Add the next hearing date for this case.</p>
        </div>
      ) : (
        <>
          <h3 className="bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:px-6">
            Upcoming
          </h3>
          {upcoming.length ? table(upcoming) : <p className="px-6 py-4 text-sm text-muted-foreground">No upcoming hearings.</p>}
          {past.length > 0 && (
            <>
              <h3 className="border-t border-border bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:px-6">
                Past
              </h3>
              {table(past)}
            </>
          )}
        </>
      )}

      {modal && (
        <HearingFormModal
          key={modal.hearing?.id ?? "new"}
          hearing={modal.hearing}
          caseId={caseId}
          date={today}
          onClose={close}
        />
      )}
    </section>
  );
}
