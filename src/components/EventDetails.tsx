"use client";

import { format } from "date-fns";
import { inTz } from "@/lib/dates";
import { STATUS_LABEL, TYPE_META, type EventDTO } from "@/lib/event-types";

export function timeRange(e: EventDTO, tz: string): string {
  if (e.allDay) return "All day";
  return `${format(inTz(e.startAt, tz), "h:mm a")} – ${format(inTz(e.endAt, tz), "h:mm a")}`;
}

function Field({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className="inline font-medium">{label}: </dt>
      <dd className="inline">{value}</dd>
    </div>
  );
}

export default function EventDetails({
  event,
  timeZone,
  onEdit,
  showDate = false,
}: {
  event: EventDTO;
  timeZone: string;
  onEdit: () => void;
  showDate?: boolean;
}) {
  const meta = TYPE_META[event.type];
  const isHearing = event.type === "COURT_HEARING";

  return (
    <button
      type="button"
      onClick={onEdit}
      className={`w-full rounded-lg border p-3 text-left hover:bg-slate-50 ${
        isHearing ? "border-red-200 bg-red-50/40" : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-start gap-2">
        <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${meta.dot}`} />
        <div className="min-w-0 flex-1">
          <p className={`font-medium ${event.status === "CANCELLED" ? "text-slate-400 line-through" : ""}`}>
            {event.title}
          </p>
          <p className="text-xs text-slate-600">
            {showDate && <>{format(inTz(event.startAt, timeZone), "EEE d MMM")} · </>}
            {timeRange(event, timeZone)} · {meta.label}
            {event.status !== "SCHEDULED" && <> · {STATUS_LABEL[event.status]}</>}
          </p>
          <dl className="mt-1 space-y-0.5 text-xs text-slate-600">
            <Field label="Court" value={event.courtName} />
            <Field label="Case" value={event.caseNumber} />
            <Field label="Client" value={event.clientName} />
            <Field label="Location" value={event.location} />
          </dl>
          {event.notes && (
            <p className="mt-1 line-clamp-3 whitespace-pre-line text-xs text-slate-500">{event.notes}</p>
          )}
        </div>
      </div>
    </button>
  );
}
