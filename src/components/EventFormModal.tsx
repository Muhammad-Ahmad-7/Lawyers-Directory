"use client";

import { startTransition, useActionState, useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useToast } from "./Toaster";
import { format } from "date-fns";
import { saveEvent, deleteEvent, type SaveEventState } from "@/app/(app)/schedule/actions";
import { dayKey, inTz } from "@/lib/dates";
import {
  EVENT_STATUSES,
  EVENT_TYPES,
  STATUS_LABEL,
  TYPE_META,
  type EventDTO,
  type EventTypeKey,
} from "@/lib/event-types";

const SHOW_CLIENT: EventTypeKey[] = ["APPOINTMENT", "CLIENT_MEETING", "COURT_HEARING", "DEADLINE"];
const SHOW_CASE: EventTypeKey[] = ["COURT_HEARING", "DEADLINE", "CLIENT_MEETING", "APPOINTMENT"];
const SHOW_COURT: EventTypeKey[] = ["COURT_HEARING"];

const input =
  "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none";

export default function EventFormModal({
  event,
  date,
  timeZone,
  onClose,
}: {
  event?: EventDTO;
  date: string;
  timeZone: string;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState<SaveEventState, FormData>(saveEvent, {});
  const [type, setType] = useState<EventTypeKey>(event?.type ?? "APPOINTMENT");
  const [allDay, setAllDay] = useState(event?.allDay ?? false);
  const [deleting, startDelete] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);

  const toast = useToast();
  useEffect(() => {
    if (state.ok) {
      toast(state.mode === "updated" ? "Event updated." : "Event created.");
      onClose();
    } else if (state.formError) {
      toast(state.formError, "error");
    }
  }, [state, onClose, toast]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    // Stop the page behind the dialog from scrolling.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const start = event ? inTz(event.startAt, timeZone) : null;
  const end = event ? inTz(event.endAt, timeZone) : null;
  const err = state.fieldErrors ?? {};

  // Rendered into <body> via a portal so no parent layout (margins, transforms,
  // overflow) can shift or clip the full-screen backdrop.
  return createPortal(
    <div
      className="fixed inset-0 z-50 m-0 flex items-end justify-center bg-slate-900/40 sm:items-center sm:p-4 print:hidden"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-form-title"
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-xl bg-white p-5 shadow-xl sm:rounded-xl"
      >
        <div className="flex items-center justify-between">
          <h2 id="event-form-title" className="text-lg font-semibold">
            {event ? "Edit event" : "New event"}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded p-1 text-slate-500 hover:bg-slate-100">
            ✕
          </button>
        </div>

        <form
          ref={formRef}
          // Submit manually instead of `action={...}` so React doesn't reset the
          // form when the server returns errors or an overlap warning.
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            startTransition(() => formAction(data));
          }}
          onChange={() => {
            if (confirmRef.current) confirmRef.current.value = "0";
          }}
          className="mt-4 space-y-3"
        >
          {event && <input type="hidden" name="id" value={event.id} />}
          <input ref={confirmRef} type="hidden" name="confirmOverlap" defaultValue="0" />

          <label className="block">
            <span className="text-sm font-medium">Title</span>
            <input name="title" required maxLength={200} defaultValue={event?.title} autoFocus className={input} />
            {err.title && <span className="text-xs text-red-600">{err.title}</span>}
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-medium">Type</span>
              <select
                name="type"
                value={type}
                onChange={(e) => {
                  const t = e.target.value as EventTypeKey;
                  setType(t);
                  if (!event && t === "DEADLINE") setAllDay(true);
                }}
                className={input}
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {TYPE_META[t].label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium">Status</span>
              <select name="status" defaultValue={event?.status ?? "SCHEDULED"} className={input}>
                {EVENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <label className="col-span-2 block sm:col-span-1">
              <span className="text-sm font-medium">Date</span>
              <input name="date" type="date" required defaultValue={start ? dayKey(start) : date} className={input} />
              {err.date && <span className="text-xs text-red-600">{err.date}</span>}
            </label>
            {!allDay && (
              <>
                <label className="block">
                  <span className="text-sm font-medium">Start</span>
                  <input
                    name="startTime"
                    type="time"
                    required
                    defaultValue={start && !event?.allDay ? format(start, "HH:mm") : "10:00"}
                    className={input}
                  />
                  {err.startTime && <span className="text-xs text-red-600">{err.startTime}</span>}
                </label>
                <label className="block">
                  <span className="text-sm font-medium">End</span>
                  <input
                    name="endTime"
                    type="time"
                    required
                    defaultValue={end && !event?.allDay ? format(end, "HH:mm") : "11:00"}
                    className={input}
                  />
                  {err.endTime && <span className="text-xs text-red-600">{err.endTime}</span>}
                </label>
              </>
            )}
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="allDay" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} />
            All day
          </label>

          {SHOW_COURT.includes(type) && (
            <label className="block">
              <span className="text-sm font-medium">Court</span>
              <input name="courtName" maxLength={200} defaultValue={event?.courtName ?? ""} className={input} />
            </label>
          )}
          {(SHOW_CASE.includes(type) || SHOW_CLIENT.includes(type)) && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {SHOW_CLIENT.includes(type) && (
                <label className="block">
                  <span className="text-sm font-medium">Client name</span>
                  <input name="clientName" maxLength={200} defaultValue={event?.clientName ?? ""} className={input} />
                </label>
              )}
              {SHOW_CASE.includes(type) && (
                <label className="block">
                  <span className="text-sm font-medium">Case number</span>
                  <input name="caseNumber" maxLength={100} defaultValue={event?.caseNumber ?? ""} className={input} />
                </label>
              )}
            </div>
          )}
          <label className="block">
            <span className="text-sm font-medium">Location</span>
            <input name="location" maxLength={200} defaultValue={event?.location ?? ""} className={input} />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Notes</span>
            <textarea name="notes" rows={3} maxLength={5000} defaultValue={event?.notes ?? ""} className={input} />
          </label>

          {state.conflicts && state.conflicts.length > 0 && (
            <div role="alert" className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
              <p className="font-medium">This overlaps with:</p>
              <ul className="mt-1 list-disc pl-5">
                {state.conflicts.map((c, i) => (
                  <li key={i}>
                    {c.title} ({format(inTz(c.startAt, timeZone), "h:mm a")} –{" "}
                    {format(inTz(c.endAt, timeZone), "h:mm a")})
                  </li>
                ))}
              </ul>
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  if (confirmRef.current) confirmRef.current.value = "1";
                  formRef.current?.requestSubmit();
                }}
                className="mt-2 rounded-md bg-amber-600 px-3 py-1.5 text-white hover:bg-amber-700 disabled:opacity-60"
              >
                Save anyway
              </button>
            </div>
          )}

          <div className="flex items-center justify-between gap-2 pt-2">
            {event ? (
              <button
                type="button"
                disabled={deleting}
                onClick={() => {
                  if (!confirm(`Delete "${event.title}"? This cannot be undone.`)) return;
                  startDelete(async () => {
                    try {
                      const res = await deleteEvent(event.id);
                      if (res.ok) {
                        toast("Event deleted.");
                        onClose();
                      } else {
                        toast("Couldn't delete the event. Please try again.", "error");
                      }
                    } catch {
                      toast("Couldn't delete the event. Please try again.", "error");
                    }
                  });
                }}
                className="rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50">
                Cancel
              </button>
              <button
                type="submit"
                disabled={pending}
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
              >
                {pending ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
