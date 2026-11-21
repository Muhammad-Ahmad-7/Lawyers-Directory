"use client";

import { format, isSameMonth } from "date-fns";
import type { TZDate } from "@date-fns/tz";
import { dayKey, formatTime } from "@/lib/dates";
import { HEARING_STATUS_META, type HearingDTO } from "@/lib/case-meta";
import { PlusIcon } from "./ui";

const MAX_VISIBLE = 3;

export default function MonthGrid({
  days,
  monthStart,
  hearingsByDay,
  today,
  selectedDay,
  onSelectDay,
  onAddOnDay,
  onOpenHearing,
}: {
  days: TZDate[];
  monthStart: TZDate;
  hearingsByDay: Map<string, HearingDTO[]>;
  today: string;
  selectedDay: string;
  onSelectDay: (key: string) => void;
  onAddOnDay: (key: string) => void;
  onOpenHearing: (h: HearingDTO) => void;
}) {
  const weekdays = days.slice(0, 7).map((d) => format(d, "EEE"));

  return (
    <div className="card overflow-hidden print:rounded-none">
      <div className="grid grid-cols-7 border-b border-border bg-slate-50 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {weekdays.map((w) => (
          <div key={w} className="py-2.5">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((d) => {
          const key = dayKey(d);
          const inMonth = isSameMonth(d, monthStart);
          const hearings = hearingsByDay.get(key) ?? [];
          const isToday = key === today;
          const isSelected = key === selectedDay;
          const extra = hearings.length - MAX_VISIBLE;

          return (
            <div
              key={key}
              role="button"
              tabIndex={0}
              aria-label={`${format(d, "EEEE d MMMM")}, ${hearings.length} hearings`}
              aria-pressed={isSelected}
              onClick={() => onSelectDay(key)}
              onDoubleClick={() => onAddOnDay(key)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectDay(key);
                }
              }}
              className={`group relative min-h-16 cursor-pointer border-b border-r border-border p-1.5 outline-none transition-colors sm:min-h-28 print:min-h-24 print:break-inside-avoid [&:nth-child(7n)]:border-r-0 ${
                inMonth ? "bg-card" : "bg-slate-50/70 text-slate-400"
              } ${
                isSelected ? "!bg-blue-50/60 ring-2 ring-inset ring-primary/40 print:ring-0" : "hover:bg-slate-50"
              } focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/60`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                    isToday ? "bg-primary text-primary-foreground" : ""
                  }`}
                >
                  {format(d, "d")}
                </span>
                <button
                  type="button"
                  aria-label={`Add hearing on ${format(d, "d MMMM")}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddOnDay(key);
                  }}
                  className="hidden h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-slate-200 hover:text-foreground focus-visible:flex group-hover:flex print:!hidden"
                >
                  <PlusIcon className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Phone: coloured dots */}
              <div className="mt-1 flex flex-wrap gap-0.5 sm:hidden print:hidden">
                {hearings.slice(0, 4).map((h) => (
                  <span key={h.id} className={`h-1.5 w-1.5 rounded-full ${HEARING_STATUS_META[h.status].dot}`} />
                ))}
                {hearings.length > 4 && <span className="text-[9px] leading-none text-muted-foreground">+</span>}
              </div>

              {/* Tablet/desktop and print: chips */}
              <div className="mt-1 hidden space-y-1 sm:block print:block">
                {hearings.map((h, i) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenHearing(h);
                    }}
                    title={[h.case?.title, h.purpose].filter(Boolean).join(" — ")}
                    className={`block w-full truncate rounded-sm border-l-2 px-1.5 py-0.5 text-left text-xs transition-colors ${
                      HEARING_STATUS_META[h.status].chip
                    } ${i >= MAX_VISIBLE ? "hidden print:block" : ""}`}
                  >
                    {h.time && <span className="font-semibold">{formatTime(h.time)} </span>}
                    {h.case?.title ?? "Hearing"}
                  </button>
                ))}
                {extra > 0 && <p className="px-1 text-xs text-muted-foreground print:hidden">+{extra} more</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
