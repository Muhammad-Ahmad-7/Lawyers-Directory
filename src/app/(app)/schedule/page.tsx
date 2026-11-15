import { addDays } from "date-fns";
import { requireUserId } from "@/auth";
import { prisma } from "@/lib/db";
import { appTimeZone, dayKey, gridRange, monthParam, nowInTz, parseMonthParam } from "@/lib/dates";
import type { EventDTO } from "@/lib/event-types";
import ScheduleView from "@/components/ScheduleView";
import type { Event } from "@prisma/client";

function toDTO(e: Event): EventDTO {
  return {
    id: e.id,
    title: e.title,
    type: e.type,
    status: e.status,
    startAt: e.startAt.toISOString(),
    endAt: e.endAt.toISOString(),
    allDay: e.allDay,
    location: e.location,
    clientName: e.clientName,
    caseNumber: e.caseNumber,
    courtName: e.courtName,
    notes: e.notes,
  };
}

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const userId = await requireUserId();
  const tz = appTimeZone();
  const { month } = await searchParams;
  const monthStart = parseMonthParam(month, tz);
  const { from, to } = gridRange(monthStart);
  const now = nowInTz(tz);

  const [monthEvents, upcoming] = await Promise.all([
    prisma.event.findMany({
      where: { userId, startAt: { lt: to }, endAt: { gte: from } },
      orderBy: [{ allDay: "desc" }, { startAt: "asc" }],
    }),
    prisma.event.findMany({
      where: {
        userId,
        endAt: { gte: now },
        startAt: { lt: addDays(now, 7) },
        status: { not: "CANCELLED" },
      },
      orderBy: { startAt: "asc" },
      take: 20,
    }),
  ]);

  return (
    <ScheduleView
      month={monthParam(monthStart)}
      timeZone={tz}
      todayKey={dayKey(now)}
      events={monthEvents.map(toDTO)}
      upcoming={upcoming.map(toDTO)}
    />
  );
}
