"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/auth";
import { prisma } from "@/lib/db";
import { appTimeZone, wallTimeToDate } from "@/lib/dates";
import { eventFormSchema, type EventFormInput } from "@/lib/validation";

export type SaveEventState = {
  ok?: boolean;
  /** Set on success. */
  mode?: "created" | "updated";
  formError?: string;
  fieldErrors?: Record<string, string>;
  /** Overlapping events; the user can confirm to save anyway. */
  conflicts?: { title: string; startAt: string; endAt: string }[];
};

export async function saveEvent(_prev: SaveEventState, formData: FormData): Promise<SaveEventState> {
  const userId = await requireUserId();
  const tz = appTimeZone();

  const str = (k: string) => {
    const v = formData.get(k);
    return typeof v === "string" ? v : undefined;
  };
  const parsed = eventFormSchema.safeParse({
    id: str("id") || undefined,
    title: str("title") ?? "",
    type: str("type"),
    status: str("status") ?? "SCHEDULED",
    date: str("date") ?? "",
    allDay: formData.get("allDay") === "on",
    startTime: str("startTime"),
    endTime: str("endTime"),
    location: str("location"),
    clientName: str("clientName"),
    caseNumber: str("caseNumber"),
    courtName: str("courtName"),
    notes: str("notes"),
    confirmOverlap: formData.get("confirmOverlap") === "1",
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return { fieldErrors };
  }
  const v = parsed.data;

  const startAt = wallTimeToDate(v.date, v.allDay ? "00:00" : v.startTime!, tz);
  const endAt = v.allDay
    ? wallTimeToDate(v.date, "23:59", tz)
    : wallTimeToDate(v.date, v.endTime!, tz);
  if (!startAt || !endAt) return { fieldErrors: { date: "Invalid date or time" } };

  try {
    return await writeEvent(userId, v, startAt, endAt);
  } catch (error) {
    console.error("Saving event failed:", error);
    return { formError: "Couldn't save the event. Please try again." };
  }
}

async function writeEvent(
  userId: string,
  v: EventFormInput,
  startAt: Date,
  endAt: Date,
): Promise<SaveEventState> {
  // Overlap check for timed, active events.
  if (!v.allDay && v.status !== "CANCELLED" && !v.confirmOverlap) {
    const overlapping = await prisma.event.findMany({
      where: {
        userId,
        allDay: false,
        status: { not: "CANCELLED" },
        startAt: { lt: endAt },
        endAt: { gt: startAt },
        ...(v.id ? { id: { not: v.id } } : {}),
      },
      orderBy: { startAt: "asc" },
      take: 5,
    });
    if (overlapping.length > 0) {
      return {
        conflicts: overlapping.map((e) => ({
          title: e.title,
          startAt: e.startAt.toISOString(),
          endAt: e.endAt.toISOString(),
        })),
      };
    }
  }

  const data = {
    title: v.title,
    type: v.type,
    status: v.status,
    startAt,
    endAt,
    allDay: v.allDay,
    location: v.location,
    clientName: v.clientName,
    caseNumber: v.caseNumber,
    courtName: v.courtName,
    notes: v.notes,
  };

  if (v.id) {
    const res = await prisma.event.updateMany({ where: { id: v.id, userId }, data });
    if (res.count === 0) return { formError: "Event not found." };
  } else {
    await prisma.event.create({ data: { ...data, userId } });
  }

  revalidatePath("/schedule");
  return { ok: true, mode: v.id ? "updated" : "created" };
}

export async function deleteEvent(id: string): Promise<{ ok: boolean }> {
  const userId = await requireUserId();
  try {
    const res = await prisma.event.deleteMany({ where: { id, userId } });
    revalidatePath("/schedule");
    return { ok: res.count > 0 };
  } catch (error) {
    console.error("Deleting event failed:", error);
    return { ok: false };
  }
}
