"use client";

import { HEARING_STATUS_META, type HearingDTO } from "@/lib/case-meta";
import { formatKey, formatTime } from "@/lib/dates";
import { HearingStatusBadge } from "./ui";

/** One hearing as a clickable row (sidebar lists, case page). */
export default function HearingItem({
  hearing,
  showDate = false,
  showCase = true,
  onClick,
}: {
  hearing: HearingDTO;
  showDate?: boolean;
  showCase?: boolean;
  onClick: () => void;
}) {
  const h = hearing;
  const when = [showDate ? formatKey(h.date, "EEE, d MMM") : null, h.time ? formatTime(h.time) : showDate ? null : "Time not set"]
    .filter(Boolean)
    .join(" · ");

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-start gap-3 rounded-md border border-border bg-card p-3 text-left transition-colors hover:border-slate-300 hover:bg-slate-50"
    >
      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${HEARING_STATUS_META[h.status].dot}`} aria-hidden="true" />
      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-2">
          <span className={`truncate text-sm font-medium ${h.status === "CANCELLED" ? "text-slate-400 line-through" : ""}`}>
            {showCase && h.case ? h.case.title : h.purpose || "Hearing"}
          </span>
          <HearingStatusBadge status={h.status} />
        </span>
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {when}
          {showCase && h.purpose ? ` · ${h.purpose}` : ""}
        </span>
        {showCase && h.case && (h.case.courtName || h.case.caseNumber) && (
          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
            {[h.case.caseNumber, h.case.courtName].filter(Boolean).join(" · ")}
          </span>
        )}
      </span>
    </button>
  );
}
