"use client";

import { EVENT_TYPES, TYPE_META, type EventTypeKey } from "@/lib/event-types";

export default function TypeFilter({
  hidden,
  onToggle,
}: {
  hidden: Set<EventTypeKey>;
  onToggle: (t: EventTypeKey) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 print:hidden" role="group" aria-label="Filter by type">
      {EVENT_TYPES.map((t) => {
        const on = !hidden.has(t);
        return (
          <button
            key={t}
            type="button"
            aria-pressed={on}
            onClick={() => onToggle(t)}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition ${
              on ? "border-slate-300 bg-white" : "border-slate-200 bg-slate-100 text-slate-400"
            }`}
          >
            <span className={`h-2.5 w-2.5 rounded-full ${on ? TYPE_META[t].dot : "bg-slate-300"}`} />
            {TYPE_META[t].label}
          </button>
        );
      })}
    </div>
  );
}
