"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { formatKey, gridDays, parseMonthParam, shiftMonth } from "@/lib/dates";
import { HEARING_STATUSES, HEARING_STATUS_META, type CaseOption, type HearingDTO } from "@/lib/case-meta";
import MonthGrid from "./MonthGrid";
import HearingItem from "./HearingItem";
import HearingFormModal from "./HearingFormModal";
import { ChevronIcon, PageHeader, PlusIcon } from "./ui";

type ModalState = { hearing?: HearingDTO; date: string } | null;

export default function CalendarView({
  month,
  timeZone,
  today,
  hearings,
  upcoming,
  cases,
}: {
  month: string;
  timeZone: string;
  today: string;
  hearings: HearingDTO[];
  upcoming: HearingDTO[];
  cases: CaseOption[];
}) {
  const monthStart = useMemo(() => parseMonthParam(month, timeZone), [month, timeZone]);
  const days = useMemo(() => gridDays(monthStart), [monthStart]);

  const [selectedDay, setSelectedDay] = useState(today.startsWith(month) ? today : `${month}-01`);
  const [modal, setModal] = useState<ModalState>(null);
  const closeModal = useCallback(() => setModal(null), []);

  const hearingsByDay = useMemo(() => {
    const map = new Map<string, HearingDTO[]>();
    for (const h of hearings) {
      const list = map.get(h.date);
      if (list) list.push(h);
      else map.set(h.date, [h]);
    }
    return map;
  }, [hearings]);

  const monthCount = useMemo(
    () => hearings.filter((h) => h.date.startsWith(month) && h.status !== "CANCELLED").length,
    [hearings, month],
  );
  const selected = hearingsByDay.get(selectedDay) ?? [];
  const navBtn = "inline-flex h-9 items-center gap-1 px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-muted";

  return (
    <div className="space-y-6">
      <PageHeader
        title={format(monthStart, "MMMM yyyy")}
        description={`${monthCount} ${monthCount === 1 ? "hearing" : "hearings"} this month`}
        actions={
          <>
            <div className="flex divide-x divide-border overflow-hidden rounded-md border border-input bg-card shadow-sm">
              <Link href={`/calendar?month=${shiftMonth(monthStart, -1)}`} className={navBtn} aria-label="Previous month">
                <ChevronIcon dir="left" />
              </Link>
              <Link href="/calendar" className={navBtn}>
                Today
              </Link>
              <Link href={`/calendar?month=${shiftMonth(monthStart, 1)}`} className={navBtn} aria-label="Next month">
                <ChevronIcon dir="right" />
              </Link>
            </div>
            <button type="button" onClick={() => window.print()} className="btn-secondary">
              Print
            </button>
            <button type="button" onClick={() => setModal({ date: selectedDay })} className="btn-primary">
              <PlusIcon /> Add hearing
            </button>
          </>
        }
      />

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground print:hidden">
        {HEARING_STATUSES.map((s) => (
          <span key={s} className="inline-flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${HEARING_STATUS_META[s].dot}`} />
            {HEARING_STATUS_META[s].label}
          </span>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px] print:block">
        <MonthGrid
          days={days}
          monthStart={monthStart}
          hearingsByDay={hearingsByDay}
          today={today}
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
          onAddOnDay={(key) => setModal({ date: key })}
          onOpenHearing={(hearing) => setModal({ hearing, date: hearing.date })}
        />

        <aside className="space-y-6 print:hidden">
          <section className="card p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">
                {selectedDay === today ? "Today" : formatKey(selectedDay, "EEEE")}
                <span className="ml-1 font-normal text-muted-foreground">{formatKey(selectedDay, "d MMMM")}</span>
              </h2>
              <button type="button" onClick={() => setModal({ date: selectedDay })} className="btn-ghost">
                <PlusIcon /> Add
              </button>
            </div>
            <div className="mt-3 space-y-2">
              {selected.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">No hearings on this day.</p>
              ) : (
                selected.map((h) => (
                  <HearingItem key={h.id} hearing={h} onClick={() => setModal({ hearing: h, date: h.date })} />
                ))
              )}
            </div>
          </section>

          <section className="card p-4">
            <h2 className="text-sm font-semibold">Next 7 days</h2>
            <div className="mt-3 space-y-2">
              {upcoming.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">No upcoming hearings.</p>
              ) : (
                upcoming.map((h) => (
                  <HearingItem key={h.id} hearing={h} showDate onClick={() => setModal({ hearing: h, date: h.date })} />
                ))
              )}
            </div>
          </section>
        </aside>
      </div>

      {modal && (
        <HearingFormModal
          key={modal.hearing?.id ?? `new-${modal.date}`}
          hearing={modal.hearing}
          cases={cases}
          date={modal.date}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
