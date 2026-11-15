"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { format, isSameMonth } from "date-fns";
import { TZDate } from "@date-fns/tz";
import { dayKey, gridDays, inTz, parseMonthParam, shiftMonth } from "@/lib/dates";
import type { EventDTO, EventTypeKey } from "@/lib/event-types";
import MonthGrid from "./MonthGrid";
import TypeFilter from "./TypeFilter";
import EventDetails from "./EventDetails";
import EventFormModal from "./EventFormModal";

type ModalState = { event?: EventDTO; date: string } | null;

export default function ScheduleView({
  month,
  timeZone,
  todayKey,
  events,
  upcoming,
}: {
  month: string;
  timeZone: string;
  todayKey: string;
  events: EventDTO[];
  upcoming: EventDTO[];
}) {
  const monthStart = useMemo(() => parseMonthParam(month, timeZone), [month, timeZone]);
  const days = useMemo(() => gridDays(monthStart), [monthStart]);
  const todayInMonth = todayKey.startsWith(month);

  const [selectedDay, setSelectedDay] = useState(todayInMonth ? todayKey : `${month}-01`);
  const [hidden, setHidden] = useState<Set<EventTypeKey>>(new Set());
  const [modal, setModal] = useState<ModalState>(null);

  const visible = useMemo(() => events.filter((e) => !hidden.has(e.type)), [events, hidden]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, EventDTO[]>();
    for (const e of visible) {
      const key = dayKey(inTz(e.startAt, timeZone));
      const list = map.get(key);
      if (list) list.push(e);
      else map.set(key, [e]);
    }
    return map;
  }, [visible, timeZone]);

  const toggleType = (t: EventTypeKey) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });

  const closeModal = useCallback(() => setModal(null), []);
  const selectedEvents = eventsByDay.get(selectedDay) ?? [];
  const selectedDate = useMemo(() => {
    const [y, m, d] = selectedDay.split("-").map(Number);
    return new TZDate(y, m - 1, d, timeZone);
  }, [selectedDay, timeZone]);

  const counts = useMemo(() => {
    const inMonth = events.filter((e) => isSameMonth(inTz(e.startAt, timeZone), monthStart));
    return {
      total: inMonth.length,
      hearings: inMonth.filter((e) => e.type === "COURT_HEARING" && e.status !== "CANCELLED").length,
    };
  }, [events, monthStart, timeZone]);

  const navBtn = "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-100";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{format(monthStart, "MMMM yyyy")}</h1>
          <p className="text-sm text-slate-500">
            {counts.total} {counts.total === 1 ? "event" : "events"} · {counts.hearings}{" "}
            {counts.hearings === 1 ? "court hearing" : "court hearings"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <Link href={`/schedule?month=${shiftMonth(monthStart, -1)}`} className={navBtn} aria-label="Previous month">
            ‹ Prev
          </Link>
          <Link href="/schedule" className={navBtn}>
            Today
          </Link>
          <Link href={`/schedule?month=${shiftMonth(monthStart, 1)}`} className={navBtn} aria-label="Next month">
            Next ›
          </Link>
          <button type="button" onClick={() => window.print()} className={navBtn}>
            Print
          </button>
          <button
            type="button"
            onClick={() => setModal({ date: selectedDay })}
            className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
          >
            + New event
          </button>
        </div>
      </div>

      <TypeFilter hidden={hidden} onToggle={toggleType} />

      <div className="grid gap-4 lg:grid-cols-[1fr_320px] print:block">
        <MonthGrid
          days={days}
          monthStart={monthStart}
          eventsByDay={eventsByDay}
          timeZone={timeZone}
          todayKey={todayKey}
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
          onAddOnDay={(key) => setModal({ date: key })}
          onEditEvent={(event) => setModal({ event, date: dayKey(inTz(event.startAt, timeZone)) })}
        />

        <aside className="space-y-4 print:hidden">
          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{format(selectedDate, "EEEE, d MMMM")}</h2>
              <button
                type="button"
                onClick={() => setModal({ date: selectedDay })}
                className="rounded-md px-2 py-1 text-sm text-slate-600 hover:bg-slate-100"
              >
                + Add
              </button>
            </div>
            <div className="mt-3 space-y-2">
              {selectedEvents.length === 0 ? (
                <p className="text-sm text-slate-500">Nothing scheduled.</p>
              ) : (
                selectedEvents.map((e) => (
                  <EventDetails
                    key={e.id}
                    event={e}
                    timeZone={timeZone}
                    onEdit={() => setModal({ event: e, date: selectedDay })}
                  />
                ))
              )}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="font-semibold">Next 7 days</h2>
            <div className="mt-3 space-y-2">
              {upcoming.length === 0 ? (
                <p className="text-sm text-slate-500">No upcoming events.</p>
              ) : (
                upcoming.map((e) => (
                  <EventDetails
                    key={e.id}
                    event={e}
                    timeZone={timeZone}
                    showDate
                    onEdit={() => setModal({ event: e, date: dayKey(inTz(e.startAt, timeZone)) })}
                  />
                ))
              )}
            </div>
          </section>
        </aside>
      </div>

      {modal && (
        <EventFormModal
          key={modal.event?.id ?? `new-${modal.date}`}
          event={modal.event}
          date={modal.date}
          timeZone={timeZone}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
