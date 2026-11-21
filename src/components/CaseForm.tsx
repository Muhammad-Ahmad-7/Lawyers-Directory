"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useToast } from "./Toaster";
import { saveCase, type FormState } from "@/app/(app)/cases/actions";
import {
  CASE_STATUSES,
  CASE_STATUS_META,
  CASE_TYPES,
  CASE_TYPE_LABEL,
  HEARING_STATUSES,
  HEARING_STATUS_META,
  type CaseStatusKey,
  type CaseTypeKey,
  type HearingStatusKey,
} from "@/lib/case-meta";

export type CaseFormValues = {
  id: string;
  title: string;
  caseType: CaseTypeKey;
  caseNumber: string | null;
  courtName: string | null;
  clientName: string | null;
  clientPhone: string | null;
  opposingParty: string | null;
  status: CaseStatusKey;
  notes: string | null;
};

/** Create or edit a case. A new case can also get its first hearing date. */
export default function CaseForm({ initial, today }: { initial?: CaseFormValues; today: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(saveCase, {});
  const toast = useToast();
  const err = state.fieldErrors ?? {};
  const isNew = !initial;
  // First hearing: a past date usually means the hearing already took place,
  // so default its status to "Held" until the lawyer picks one themselves.
  const [hearingStatus, setHearingStatus] = useState<HearingStatusKey>("SCHEDULED");
  const [statusTouched, setStatusTouched] = useState(false);

  useEffect(() => {
    if (state.formError) toast(state.formError, "error");
  }, [state, toast]);

  const field = (name: keyof CaseFormValues | "hearingDate" | "hearingTime" | "purpose" | "status", label: React.ReactNode, input: React.ReactNode) => (
    <label className="block">
      <span className="field-label">{label}</span>
      {input}
      {err[name] && <span className="field-error">{err[name]}</span>}
    </label>
  );
  const optional = <span className="font-normal text-muted-foreground">(optional)</span>;

  return (
    <form
      // Submit manually so React doesn't reset the form when the server returns errors.
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => formAction(data));
      }}
      className="space-y-6"
    >
      {initial && <input type="hidden" name="id" value={initial.id} />}

      <section className="card p-6">
        <h2 className="text-base font-semibold">Case details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            {field(
              "title",
              "Case title",
              <input
                name="title"
                required
                maxLength={200}
                autoFocus
                placeholder="e.g. Ahmed Khan vs. State"
                defaultValue={initial?.title}
                className="field mt-1"
                aria-invalid={!!err.title}
              />,
            )}
          </div>
          {field(
            "caseType",
            "Case type",
            <select
              name="caseType"
              required
              defaultValue={initial?.caseType ?? ""}
              className="field mt-1"
              aria-invalid={!!err.caseType}
            >
              <option value="" disabled>
                Select case type…
              </option>
              {CASE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {CASE_TYPE_LABEL[t]}
                </option>
              ))}
            </select>,
          )}
          {field(
            "caseNumber",
            <>Case number {optional}</>,
            <input name="caseNumber" maxLength={100} placeholder="e.g. 1234/2026" defaultValue={initial?.caseNumber ?? ""} className="field mt-1" />,
          )}
          {field(
            "courtName",
            <>Court {optional}</>,
            <input name="courtName" maxLength={200} placeholder="e.g. Civil Court, Lahore" defaultValue={initial?.courtName ?? ""} className="field mt-1" />,
          )}
          {field(
            "opposingParty",
            <>Opposing party {optional}</>,
            <input name="opposingParty" maxLength={200} defaultValue={initial?.opposingParty ?? ""} className="field mt-1" />,
          )}
          {field(
            "status",
            "Status",
            <select name="status" defaultValue={initial?.status ?? "ACTIVE"} className="field mt-1">
              {CASE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {CASE_STATUS_META[s].label}
                </option>
              ))}
            </select>,
          )}
        </div>
      </section>

      <section className="card p-6">
        <h2 className="text-base font-semibold">Client</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {field(
            "clientName",
            <>Client name {optional}</>,
            <input name="clientName" maxLength={200} defaultValue={initial?.clientName ?? ""} className="field mt-1" />,
          )}
          {field(
            "clientPhone",
            <>Client phone / WhatsApp {optional}</>,
            <input
              name="clientPhone"
              type="tel"
              placeholder="+92 300 1234567"
              defaultValue={initial?.clientPhone ?? ""}
              className="field mt-1"
              aria-invalid={!!err.clientPhone}
            />,
          )}
          <div className="sm:col-span-2">
            {field(
              "notes",
              <>Notes {optional}</>,
              <textarea name="notes" rows={4} maxLength={5000} defaultValue={initial?.notes ?? ""} className="field mt-1" />,
            )}
          </div>
        </div>
      </section>

      {isNew && (
        <section className="card p-6">
          <h2 className="text-base font-semibold">First hearing</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Optional. The date can be in the past if you&apos;re recording a running or older case. You can add more
            hearing dates from the case page.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {field(
              "hearingDate",
              "Hearing date",
              <input
                name="hearingDate"
                type="date"
                className="field mt-1"
                aria-invalid={!!err.hearingDate}
                onChange={(e) => {
                  if (!statusTouched) setHearingStatus(e.target.value && e.target.value < today ? "HELD" : "SCHEDULED");
                }}
              />,
            )}
            {field(
              "hearingTime",
              <>Time {optional}</>,
              <input name="hearingTime" type="time" className="field mt-1" aria-invalid={!!err.hearingTime} />,
            )}
            {field("purpose", <>Purpose {optional}</>, <input name="purpose" maxLength={200} placeholder="e.g. First hearing" className="field mt-1" />)}
            <label className="block">
              <span className="field-label">Hearing status</span>
              <select
                name="hearingStatus"
                value={hearingStatus}
                onChange={(e) => {
                  setHearingStatus(e.target.value as HearingStatusKey);
                  setStatusTouched(true);
                }}
                className="field mt-1"
              >
                {HEARING_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {HEARING_STATUS_META[s].label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>
      )}

      <div className="flex justify-end gap-2">
        <Link href={initial ? `/cases/${initial.id}` : "/cases"} className="btn-secondary">
          Cancel
        </Link>
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Saving…" : isNew ? "Create case" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
