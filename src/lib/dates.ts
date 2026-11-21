import { TZDate } from "@date-fns/tz";
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
} from "date-fns";

/** Monday-first weeks. */
export const WEEK_STARTS_ON = 1 as const;

/** The timezone the lawyer works in. "Today" and the calendar use this zone. */
export function appTimeZone(): string {
  return process.env.APP_TIMEZONE || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

export function nowInTz(tz: string): TZDate {
  return new TZDate(Date.now(), tz);
}

/** "2026-11" → first day of that month in tz. Falls back to the current month. */
export function parseMonthParam(param: string | undefined, tz: string): TZDate {
  const m = param?.match(/^(\d{4})-(\d{2})$/);
  if (m) {
    const year = Number(m[1]);
    const month = Number(m[2]) - 1;
    if (year >= 1970 && year <= 9999 && month >= 0 && month <= 11) {
      return new TZDate(year, month, 1, tz);
    }
  }
  return startOfMonth(nowInTz(tz));
}

export function monthParam(d: Date): string {
  return format(d, "yyyy-MM");
}

export function shiftMonth(monthStart: TZDate, delta: number): string {
  return monthParam(addMonths(monthStart, delta));
}

/** Every day shown on the month grid (full weeks). */
export function gridDays(monthStart: TZDate): TZDate[] {
  const start = startOfWeek(startOfMonth(monthStart), { weekStartsOn: WEEK_STARTS_ON });
  const end = endOfWeek(endOfMonth(monthStart), { weekStartsOn: WEEK_STARTS_ON });
  return eachDayOfInterval({ start, end }) as TZDate[];
}

/** "yyyy-MM-dd" of a date, read in the date's own zone. */
export function dayKey(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

export function todayKey(tz: string): string {
  return dayKey(nowInTz(tz));
}

// ---- Date-only values (hearing dates) ---------------------------------------
// Hearing dates are stored in a Postgres DATE column. Prisma hands them over as
// a Date at UTC midnight, so they are converted with UTC on both sides and never
// shift with the server's or browser's timezone.

const KEY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** True for a real calendar date such as "2026-02-28" (rejects "2026-02-30"). */
export function isValidDateKey(key: string): boolean {
  const m = key.match(KEY_RE);
  if (!m) return false;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return d.toISOString().slice(0, 10) === key;
}

/** "2026-11-20" → Date for a DATE column. */
export function keyToDbDate(key: string): Date {
  return new Date(`${key}T00:00:00.000Z`);
}

/** DATE column value → "2026-11-20". */
export function dbDateToKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function addDaysToKey(key: string, days: number): string {
  return dbDateToKey(addDays(keyToDbDate(key), days));
}

/** Format a "yyyy-MM-dd" key with a date-fns pattern, e.g. "EEE, d MMM yyyy". */
export function formatKey(key: string, pattern: string): string {
  const [y, m, d] = key.split("-").map(Number);
  return format(new Date(y, m - 1, d), pattern);
}

/** "14:30" → "2:30 PM". */
export function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  return format(new Date(2000, 0, 1, h, m), "h:mm a");
}
