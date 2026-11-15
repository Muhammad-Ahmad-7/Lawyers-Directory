"use client";

import { format, isSameMonth } from "date-fns";
import type { TZDate } from "@date-fns/tz";
import { dayKey } from "@/lib/dates";
import { TYPE_META, type EventDTO } from "@/lib/event-types";
import EventChip from "./EventChip";

const MAX_VISIBLE = 3;

export default function MonthGrid({
  days,
  monthStart,
  eventsByDay,
  timeZone,
  todayKey,
  selectedDay,
  onSelectDay,
  onAddOnDay,
  onEditEvent,
}: {
  days: TZDate[];
  monthStart: TZDate;
  eventsByDay: Map<string, EventDTO[]>;
  timeZone: string;
  todayKey: string;
  selectedDay: string;
  onSelectDay: (key: string) => void;
  onAddOnDay: (key: string) => void;
  onEditEvent: (e: EventDTO) => void;
}) {
  const weekdays = days.slice(0, 7).map((d) => format(d, "EEE"));

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white print:rounded-none print:border-slate-400">
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-medium uppercase tracking-wide text-slate-500">
        {weekdays.map((w) => (
          <div key={w} className="py-2">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((d) => {
          const key = dayKey(d);
          const inMonth = isSameMonth(d, monthStart);
          const events = eventsByDay.get(key) ?? [];
          const isToday = key === todayKey;
          const isSelected = key === selectedDay;
          const extra = events.length - MAX_VISIBLE;

          return (
            <div
              key={key}
              role="button"
              tabIndex={0}
              aria-label={`${format(d, "EEEE d MMMM")}, ${events.length} events`}
              aria-pressed={isSelected}
              onClick={() => onSelectDay(key)}
              onDoubleClick={() => onAddOnDay(key)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectDay(key);
                }
              }}
              className={`group relative min-h-16 cursor-pointer border-b border-r border-slate-100 p-1 outline-none sm:min-h-28 print:min-h-24 print:break-inside-avoid print:border-slate-300 ${
                inMonth ? "bg-white" : "bg-slate-50 text-slate-400"
              } ${
                isSelected ? "ring-2 ring-inset ring-slate-900 print:ring-0" : "hover:bg-slate-50"
              } focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-500`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                    isToday ? "bg-slate-900 text-white" : ""
                  }`}
                >
                  {format(d, "d")}
                </span>
                <button
                  type="button"
                  aria-label={`Add event on ${format(d, "d MMMM")}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddOnDay(key);
                  }}
                  className="hidden h-6 w-6 items-center justify-center rounded text-slate-500 hover:bg-slate-200 group-hover:flex print:!hidden"
                >
                  +
                </button>
              </div>

              {/* Phone: coloured dots */}
              <div className="mt-1 flex flex-wrap gap-0.5 sm:hidden print:hidden">
                {events.slice(0, 4).map((e) => (
                  <span key={e.id} className={`h-1.5 w-1.5 rounded-full ${TYPE_META[e.type].dot}`} />
                ))}
                {events.length > 4 && <span className="text-[9px] leading-none">+</span>}
              </div>

              {/* Tablet/desktop and print: chips */}
              <div className="mt-1 hidden space-y-0.5 sm:block print:block">
                {events.map((e, i) => (
                  <EventChip
                    key={e.id}
                    event={e}
                    timeZone={timeZone}
                    onClick={() => onEditEvent(e)}
                    className={i >= MAX_VISIBLE ? "hidden print:block" : ""}
                  />
                ))}
                {extra > 0 && <p className="px-1 text-xs text-slate-500 print:hidden">+{extra} more</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
