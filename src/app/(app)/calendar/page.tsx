import { requireUserId } from "@/auth";
import { prisma } from "@/lib/db";
import { addDaysToKey, appTimeZone, dayKey, gridDays, keyToDbDate, monthParam, parseMonthParam, todayKey } from "@/lib/dates";
import { hearingCaseSelect, hearingOrder, toHearingDTO } from "@/lib/hearing-dto";
import CalendarView from "@/components/CalendarView";

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const userId = await requireUserId();
  const tz = appTimeZone();
  const { month } = await searchParams;
  const monthStart = parseMonthParam(month, tz);
  const days = gridDays(monthStart);
  const from = dayKey(days[0]);
  const to = dayKey(days[days.length - 1]);
  const today = todayKey(tz);

  const [monthHearings, upcoming, cases] = await Promise.all([
    prisma.caseHearing.findMany({
      where: { case: { lawyerId: userId }, hearingDate: { gte: keyToDbDate(from), lte: keyToDbDate(to) } },
      include: { case: hearingCaseSelect },
      orderBy: hearingOrder,
    }),
    prisma.caseHearing.findMany({
      where: {
        case: { lawyerId: userId },
        hearingDate: { gte: keyToDbDate(today), lte: keyToDbDate(addDaysToKey(today, 7)) },
        status: { not: "CANCELLED" },
      },
      include: { case: hearingCaseSelect },
      orderBy: hearingOrder,
      take: 20,
    }),
    // For the "Add hearing" case picker: open cases first.
    prisma.case.findMany({
      where: { lawyerId: userId, status: { not: "CLOSED" } },
      select: { id: true, title: true, caseNumber: true },
      orderBy: { title: "asc" },
    }),
  ]);

  return (
    <CalendarView
      month={monthParam(monthStart)}
      timeZone={tz}
      today={today}
      hearings={monthHearings.map(toHearingDTO)}
      upcoming={upcoming.map(toHearingDTO)}
      cases={cases}
    />
  );
}
