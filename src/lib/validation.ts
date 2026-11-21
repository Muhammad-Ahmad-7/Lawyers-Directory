import { z } from "zod";
import { CASE_STATUSES, CASE_TYPES, HEARING_STATUSES } from "./case-meta";
import { isValidDateKey } from "./dates";

/** Optional text: trimmed, empty → null. */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep this under ${max} characters`)
    .optional()
    .transform((v) => (v ? v : null));

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Phone / WhatsApp: spaces, dashes, dots and brackets removed; 7–15 digits with optional leading "+". */
export const phoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s\-().]/g, ""))
  .refine((v) => /^\+?\d{7,15}$/.test(v), "Enter a valid number, e.g. +923001234567");

const optionalPhone = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v.replace(/[\s\-().]/g, "") : null))
  .refine((v) => v === null || /^\+?\d{7,15}$/.test(v), "Enter a valid number, e.g. +923001234567");

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must be at most 30 characters")
  .regex(/^[a-z0-9._-]+$/, "Use only letters, numbers, dots, dashes and underscores");

export const signupSchema = z
  .object({
    name: z.string().trim().min(1, "Enter your full name").max(100),
    username: usernameSchema,
    email: z.string().trim().toLowerCase().min(1, "Enter your email").email("Enter a valid email").max(200),
    phone: phoneSchema,
    password: z.string().min(8, "Password must be at least 8 characters").max(200, "Password is too long"),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match",
  });

const hearingFields = {
  hearingDate: z.string().refine(isValidDateKey, "Pick a valid date"),
  hearingTime: z
    .string()
    .optional()
    .transform((v) => (v ? v : null))
    .refine((v) => v === null || TIME_RE.test(v), "Enter a valid time"),
  purpose: optionalText(200),
};

export const caseFormSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1, "Case title is required").max(200),
  caseType: z.enum(CASE_TYPES, { errorMap: () => ({ message: "Choose a case type" }) }),
  caseNumber: optionalText(100),
  courtName: optionalText(200),
  clientName: optionalText(200),
  clientPhone: optionalPhone,
  opposingParty: optionalText(200),
  status: z.enum(CASE_STATUSES),
  notes: optionalText(5000),
});
export type CaseFormInput = z.infer<typeof caseFormSchema>;

/** Optional first hearing when a case is created. Past dates are allowed (recording older cases). */
export const firstHearingSchema = z.object({ ...hearingFields, status: z.enum(HEARING_STATUSES) });

export const hearingFormSchema = z.object({
  id: z.string().optional(),
  caseId: z.string().min(1, "Choose a case"),
  ...hearingFields,
  status: z.enum(HEARING_STATUSES),
  notes: optionalText(5000),
});
export type HearingFormInput = z.infer<typeof hearingFormSchema>;

/** First message per field, for showing under inputs. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) out[String(issue.path[0] ?? "form")] ??= issue.message;
  return out;
}
