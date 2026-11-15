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

/** The timezone the lawyer works in. All dates are shown and entered in this zone. */
export function appTimeZone(): string {
  return process.env.APP_TIMEZONE || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

export function inTz(value: Date | string | number, tz: string): TZDate {
  return new TZDate(new Date(value).getTime(), tz);
}

export function nowInTz(tz: string): TZDate {
  return inTz(Date.now(), tz);
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

/** Query range covering the whole grid (exclusive end). */
export function gridRange(monthStart: TZDate): { from: Date; to: Date } {
  const days = gridDays(monthStart);
  return { from: days[0], to: addDays(days[days.length - 1], 1) };
}

export function dayKey(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

/** "2026-11-14" + "09:30" in tz → absolute Date. */
export function wallTimeToDate(date: string, time: string, tz: string): Date | null {
  const dm = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const tm = time.match(/^(\d{2}):(\d{2})$/);
  if (!dm || !tm) return null;
  const d = new TZDate(
    Number(dm[1]),
    Number(dm[2]) - 1,
    Number(dm[3]),
    Number(tm[1]),
    Number(tm[2]),
    tz,
  );
  if (Number.isNaN(d.getTime()) || dayKey(d) !== date) return null;
  return new Date(d.getTime());
}
