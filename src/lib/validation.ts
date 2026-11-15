import { z } from "zod";
import { EVENT_STATUSES, EVENT_TYPES } from "./event-types";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : null));

export const eventFormSchema = z
  .object({
    id: z.string().optional(),
    title: z.string().trim().min(1, "Title is required").max(200),
    type: z.enum(EVENT_TYPES),
    status: z.enum(EVENT_STATUSES),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date"),
    allDay: z.boolean(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    location: optionalText(200),
    clientName: optionalText(200),
    caseNumber: optionalText(100),
    courtName: optionalText(200),
    notes: optionalText(5000),
    confirmOverlap: z.boolean(),
  })
  .superRefine((v, ctx) => {
    if (v.allDay) return;
    const re = /^\d{2}:\d{2}$/;
    if (!v.startTime || !re.test(v.startTime)) {
      ctx.addIssue({ code: "custom", path: ["startTime"], message: "Start time is required" });
    }
    if (!v.endTime || !re.test(v.endTime)) {
      ctx.addIssue({ code: "custom", path: ["endTime"], message: "End time is required" });
    }
    if (v.startTime && v.endTime && re.test(v.startTime) && re.test(v.endTime) && v.endTime <= v.startTime) {
      ctx.addIssue({ code: "custom", path: ["endTime"], message: "End time must be after start time" });
    }
  });

export type EventFormInput = z.infer<typeof eventFormSchema>;
