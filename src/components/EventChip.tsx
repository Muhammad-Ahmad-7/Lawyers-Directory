"use client";

import { format } from "date-fns";
import { inTz } from "@/lib/dates";
import { TYPE_META, type EventDTO } from "@/lib/event-types";

export default function EventChip({
  event,
  timeZone,
  onClick,
  className = "",
}: {
  event: EventDTO;
  timeZone: string;
  onClick: () => void;
  className?: string;
}) {
  const meta = TYPE_META[event.type];
  const cancelled = event.status === "CANCELLED";
  const time = event.allDay ? "" : format(inTz(event.startAt, timeZone), "h:mm a");

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title={`${meta.label}: ${event.title}`}
      className={`block w-full truncate rounded border px-1.5 py-0.5 text-left text-xs leading-tight hover:brightness-95 ${meta.chip} ${
        cancelled ? "line-through opacity-60" : ""
      } ${className}`}
    >
      {time && <span className="font-medium">{time} </span>}
      {event.title}
    </button>
  );
}
