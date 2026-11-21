export const CASE_STATUSES = ["ACTIVE", "ON_HOLD", "CLOSED"] as const;
export type CaseStatusKey = (typeof CASE_STATUSES)[number];

export const CASE_TYPES = [
  "CIVIL",
  "CRIMINAL",
  "FAMILY",
  "PROPERTY",
  "RENT",
  "CORPORATE",
  "BANKING",
  "LABOUR",
  "TAX",
  "CONSTITUTIONAL",
  "OTHER",
] as const;
export type CaseTypeKey = (typeof CASE_TYPES)[number];

export const CASE_TYPE_LABEL: Record<CaseTypeKey, string> = {
  CIVIL: "Civil",
  CRIMINAL: "Criminal",
  FAMILY: "Family",
  PROPERTY: "Property",
  RENT: "Rent",
  CORPORATE: "Corporate",
  BANKING: "Banking",
  LABOUR: "Labour / Service",
  TAX: "Tax",
  CONSTITUTIONAL: "Constitutional / Writ",
  OTHER: "Other",
};

export const HEARING_STATUSES = ["SCHEDULED", "HELD", "ADJOURNED", "CANCELLED"] as const;
export type HearingStatusKey = (typeof HEARING_STATUSES)[number];

// Full class strings so Tailwind keeps them in the build.
export const CASE_STATUS_META: Record<CaseStatusKey, { label: string; badge: string }> = {
  ACTIVE: { label: "Active", badge: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" },
  ON_HOLD: { label: "On hold", badge: "bg-amber-50 text-amber-800 ring-amber-600/20" },
  CLOSED: { label: "Closed", badge: "bg-slate-100 text-slate-600 ring-slate-500/20" },
};

export const HEARING_STATUS_META: Record<HearingStatusKey, { label: string; badge: string; dot: string; chip: string }> = {
  SCHEDULED: {
    label: "Scheduled",
    badge: "bg-blue-50 text-blue-700 ring-blue-600/20",
    dot: "bg-blue-600",
    chip: "border-l-blue-600 bg-blue-50 text-blue-900 hover:bg-blue-100",
  },
  HELD: {
    label: "Held",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    dot: "bg-emerald-600",
    chip: "border-l-emerald-600 bg-emerald-50 text-emerald-900 hover:bg-emerald-100",
  },
  ADJOURNED: {
    label: "Adjourned",
    badge: "bg-amber-50 text-amber-800 ring-amber-600/20",
    dot: "bg-amber-500",
    chip: "border-l-amber-500 bg-amber-50 text-amber-900 hover:bg-amber-100",
  },
  CANCELLED: {
    label: "Cancelled",
    badge: "bg-slate-100 text-slate-600 ring-slate-500/20",
    dot: "bg-slate-400",
    chip: "border-l-slate-400 bg-slate-100 text-slate-500 line-through hover:bg-slate-200",
  },
};

/** A hearing as passed from server to client components. */
export type HearingDTO = {
  id: string;
  caseId: string;
  /** "yyyy-MM-dd" */
  date: string;
  /** "HH:mm" or null */
  time: string | null;
  purpose: string | null;
  status: HearingStatusKey;
  notes: string | null;
  /** Present where hearings from several cases are listed together. */
  case?: { id: string; title: string; caseNumber: string | null; courtName: string | null };
};

/** A case in a dropdown. */
export type CaseOption = { id: string; title: string; caseNumber: string | null };
