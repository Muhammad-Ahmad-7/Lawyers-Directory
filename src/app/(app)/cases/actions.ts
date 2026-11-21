"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUserId } from "@/auth";
import { prisma } from "@/lib/db";
import type { HearingStatusKey } from "@/lib/case-meta";
import { keyToDbDate } from "@/lib/dates";
import { setFlash } from "@/lib/flash";
import { caseFormSchema, fieldErrors, firstHearingSchema, hearingFormSchema } from "@/lib/validation";

export type FormState = {
  ok?: boolean;
  mode?: "created" | "updated";
  formError?: string;
  fieldErrors?: Record<string, string>;
};

function reader(formData: FormData) {
  return (k: string) => {
    const v = formData.get(k);
    return typeof v === "string" ? v : undefined;
  };
}

/** Every page shows cases or hearings, so refresh them all after a change. */
function refresh() {
  revalidatePath("/", "layout");
}

// ---- Cases ------------------------------------------------------------------

export async function saveCase(_prev: FormState, formData: FormData): Promise<FormState> {
  const userId = await requireUserId();
  const str = reader(formData);

  const parsed = caseFormSchema.safeParse({
    id: str("id") || undefined,
    title: str("title") ?? "",
    caseType: str("caseType") ?? "",
    caseNumber: str("caseNumber"),
    courtName: str("courtName"),
    clientName: str("clientName"),
    clientPhone: str("clientPhone"),
    opposingParty: str("opposingParty"),
    status: str("status") ?? "ACTIVE",
    notes: str("notes"),
  });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };
  const { id, ...data } = parsed.data;

  // A new case may come with its first hearing date.
  let firstHearing:
    | { hearingDate: Date; hearingTime: string | null; purpose: string | null; status: HearingStatusKey }
    | undefined;
  if (!id && str("hearingDate")) {
    const h = firstHearingSchema.safeParse({
      hearingDate: str("hearingDate"),
      hearingTime: str("hearingTime"),
      purpose: str("purpose"),
      status: str("hearingStatus") ?? "SCHEDULED",
    });
    if (!h.success) return { fieldErrors: fieldErrors(h.error) };
    firstHearing = { ...h.data, hearingDate: keyToDbDate(h.data.hearingDate) };
  }

  let caseId: string;
  try {
    if (id) {
      const res = await prisma.case.updateMany({ where: { id, lawyerId: userId }, data });
      if (res.count === 0) return { formError: "Case not found." };
      caseId = id;
    } else {
      const created = await prisma.case.create({
        data: {
          ...data,
          lawyerId: userId,
          ...(firstHearing ? { hearings: { create: firstHearing } } : {}),
        },
        select: { id: true },
      });
      caseId = created.id;
    }
  } catch (error) {
    console.error("Saving case failed:", error);
    return { formError: "Couldn't save the case. Please try again." };
  }

  refresh();
  await setFlash(id ? "Case updated." : "Case created.");
  redirect(`/cases/${caseId}`);
}

export async function deleteCase(id: string): Promise<{ ok: boolean }> {
  const userId = await requireUserId();
  let ok = false;
  try {
    // Hearings are removed with the case (ON DELETE CASCADE).
    const res = await prisma.case.deleteMany({ where: { id, lawyerId: userId } });
    ok = res.count > 0;
  } catch (error) {
    console.error("Deleting case failed:", error);
  }
  if (!ok) return { ok: false };
  refresh();
  await setFlash("Case deleted.");
  redirect("/cases");
}

// ---- Hearings ---------------------------------------------------------------

export async function saveHearing(_prev: FormState, formData: FormData): Promise<FormState> {
  const userId = await requireUserId();
  const str = reader(formData);

  const parsed = hearingFormSchema.safeParse({
    id: str("id") || undefined,
    caseId: str("caseId") ?? "",
    hearingDate: str("hearingDate") ?? "",
    hearingTime: str("hearingTime"),
    purpose: str("purpose"),
    status: str("status") ?? "SCHEDULED",
    notes: str("notes"),
  });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };
  const { id, caseId, hearingDate, ...rest } = parsed.data;
  const data = { ...rest, caseId, hearingDate: keyToDbDate(hearingDate) };

  try {
    // The hearing's case must belong to this lawyer.
    const owned = await prisma.case.findFirst({ where: { id: caseId, lawyerId: userId }, select: { id: true } });
    if (!owned) return { fieldErrors: { caseId: "Choose one of your cases" } };

    if (id) {
      const res = await prisma.caseHearing.updateMany({
        where: { id, case: { lawyerId: userId } },
        data,
      });
      if (res.count === 0) return { formError: "Hearing not found." };
    } else {
      await prisma.caseHearing.create({ data });
    }
  } catch (error) {
    console.error("Saving hearing failed:", error);
    return { formError: "Couldn't save the hearing. Please try again." };
  }

  refresh();
  return { ok: true, mode: id ? "updated" : "created" };
}

export async function deleteHearing(id: string): Promise<{ ok: boolean }> {
  const userId = await requireUserId();
  try {
    const res = await prisma.caseHearing.deleteMany({ where: { id, case: { lawyerId: userId } } });
    refresh();
    return { ok: res.count > 0 };
  } catch (error) {
    console.error("Deleting hearing failed:", error);
    return { ok: false };
  }
}
