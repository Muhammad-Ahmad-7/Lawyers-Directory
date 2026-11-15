export const EVENT_TYPES = [
  "APPOINTMENT",
  "COURT_HEARING",
  "CLIENT_MEETING",
  "DEADLINE",
  "OTHER",
] as const;
export type EventTypeKey = (typeof EVENT_TYPES)[number];

export const EVENT_STATUSES = ["SCHEDULED", "COMPLETED", "ADJOURNED", "CANCELLED"] as const;
export type EventStatusKey = (typeof EVENT_STATUSES)[number];

// Full class strings so Tailwind keeps them in the build.
export const TYPE_META: Record<
  EventTypeKey,
  { label: string; chip: string; dot: string; ring: string }
> = {
  APPOINTMENT: {
    label: "Appointment",
    chip: "bg-blue-100 text-blue-900 border-blue-300",
    dot: "bg-blue-500",
    ring: "ring-blue-400",
  },
  COURT_HEARING: {
    label: "Court hearing",
    chip: "bg-red-100 text-red-900 border-red-300",
    dot: "bg-red-500",
    ring: "ring-red-400",
  },
  CLIENT_MEETING: {
    label: "Client meeting",
    chip: "bg-emerald-100 text-emerald-900 border-emerald-300",
    dot: "bg-emerald-500",
    ring: "ring-emerald-400",
  },
  DEADLINE: {
    label: "Deadline",
    chip: "bg-amber-100 text-amber-900 border-amber-300",
    dot: "bg-amber-500",
    ring: "ring-amber-400",
  },
  OTHER: {
    label: "Other",
    chip: "bg-slate-100 text-slate-800 border-slate-300",
    dot: "bg-slate-500",
    ring: "ring-slate-400",
  },
};

export const STATUS_LABEL: Record<EventStatusKey, string> = {
  SCHEDULED: "Scheduled",
  COMPLETED: "Completed",
  ADJOURNED: "Adjourned",
  CANCELLED: "Cancelled",
};

/** Event shape passed from server to client components (dates as ISO strings). */
export type EventDTO = {
  id: string;
  title: string;
  type: EventTypeKey;
  status: EventStatusKey;
  startAt: string;
  endAt: string;
  allDay: boolean;
  location: string | null;
  clientName: string | null;
  caseNumber: string | null;
  courtName: string | null;
  notes: string | null;
};
