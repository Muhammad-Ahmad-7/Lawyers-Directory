import type { Case, CaseHearing } from "@prisma/client";
import type { HearingDTO } from "./case-meta";
import { dbDateToKey } from "./dates";

type HearingRow = CaseHearing & { case?: Pick<Case, "id" | "title" | "caseNumber" | "courtName"> };

export function toHearingDTO(h: HearingRow): HearingDTO {
  return {
    id: h.id,
    caseId: h.caseId,
    date: dbDateToKey(h.hearingDate),
    time: h.hearingTime,
    purpose: h.purpose,
    status: h.status,
    notes: h.notes,
    ...(h.case
      ? { case: { id: h.case.id, title: h.case.title, caseNumber: h.case.caseNumber, courtName: h.case.courtName } }
      : {}),
  };
}

/** Prisma `select` for the case summary shown next to a hearing. */
export const hearingCaseSelect = { select: { id: true, title: true, caseNumber: true, courtName: true } } as const;

/** Sort order for hearings on one day: timed ones by time, untimed last. */
export const hearingOrder = [{ hearingDate: "asc" as const }, { hearingTime: { sort: "asc" as const, nulls: "last" as const } }];
