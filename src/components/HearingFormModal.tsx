"use client";

import { startTransition, useActionState, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import Modal from "./Modal";
import { useToast } from "./Toaster";
import { deleteHearing, saveHearing, type FormState } from "@/app/(app)/cases/actions";
import { HEARING_STATUSES, HEARING_STATUS_META, type CaseOption, type HearingDTO } from "@/lib/case-meta";
import { formatKey } from "@/lib/dates";

/**
 * Add or edit a hearing. Pass `caseId` when the case is fixed (case page), or
 * `cases` to let the lawyer pick one (calendar).
 */
export default function HearingFormModal({
  hearing,
  caseId,
  cases,
  date,
  onClose,
}: {
  hearing?: HearingDTO;
  caseId?: string;
  cases?: CaseOption[];
  date: string;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(saveHearing, {});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, startDelete] = useTransition();
  const keepRef = useRef<HTMLButtonElement>(null);
  const toast = useToast();

  useEffect(() => {
    if (state.ok) {
      toast(state.mode === "updated" ? "Hearing updated." : "Hearing added.");
      onClose();
    } else if (state.formError) {
      toast(state.formError, "error");
    }
  }, [state, onClose, toast]);

  useEffect(() => {
    if (confirmDelete) keepRef.current?.focus();
  }, [confirmDelete]);

  const err = state.fieldErrors ?? {};
  const fixedCaseId = hearing?.caseId ?? caseId;
  const fixedCase = hearing?.case;

  return (
    <Modal
      title={hearing ? "Edit hearing" : "Add hearing"}
      onClose={onClose}
      onEscape={() => {
        if (!confirmDelete) return false;
        setConfirmDelete(false);
        return true;
      }}
    >
      {!fixedCaseId && cases && cases.length === 0 ? (
        <div className="space-y-4 text-sm">
          <p className="text-slate-600">You need a case before you can add a hearing.</p>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <Link href="/cases/new" className="btn-primary">
              Create a case
            </Link>
          </div>
        </div>
      ) : (
        <form
          // Submit manually so React doesn't reset the form when the server returns errors.
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            startTransition(() => formAction(data));
          }}
          className="space-y-4"
        >
          {hearing && <input type="hidden" name="id" value={hearing.id} />}

          {fixedCaseId ? (
            <>
              <input type="hidden" name="caseId" value={fixedCaseId} />
              {fixedCase && (
                <div className="rounded-md bg-muted px-3 py-2 text-sm">
                  <Link href={`/cases/${fixedCase.id}`} className="font-medium text-primary hover:underline">
                    {fixedCase.title}
                  </Link>
                  {fixedCase.caseNumber && <span className="text-muted-foreground"> · {fixedCase.caseNumber}</span>}
                </div>
              )}
            </>
          ) : (
            <label className="block">
              <span className="field-label">Case</span>
              <select name="caseId" required defaultValue="" className="field mt-1" aria-invalid={!!err.caseId}>
                <option value="" disabled>
                  Select a case…
                </option>
                {cases?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                    {c.caseNumber ? ` (${c.caseNumber})` : ""}
                  </option>
                ))}
              </select>
              {err.caseId && <span className="field-error">{err.caseId}</span>}
            </label>
          )}

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="field-label">Hearing date</span>
              <input
                name="hearingDate"
                type="date"
                required
                defaultValue={hearing?.date ?? date}
                autoFocus
                className="field mt-1"
                aria-invalid={!!err.hearingDate}
              />
              {err.hearingDate && <span className="field-error">{err.hearingDate}</span>}
            </label>
            <label className="block">
              <span className="field-label">
                Time <span className="font-normal text-muted-foreground">(optional)</span>
              </span>
              <input
                name="hearingTime"
                type="time"
                defaultValue={hearing?.time ?? ""}
                className="field mt-1"
                aria-invalid={!!err.hearingTime}
              />
              {err.hearingTime && <span className="field-error">{err.hearingTime}</span>}
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="field-label">Purpose</span>
              <input
                name="purpose"
                maxLength={200}
                placeholder="e.g. Arguments"
                defaultValue={hearing?.purpose ?? ""}
                className="field mt-1"
              />
            </label>
            <label className="block">
              <span className="field-label">Status</span>
              <select name="status" defaultValue={hearing?.status ?? "SCHEDULED"} className="field mt-1">
                {HEARING_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {HEARING_STATUS_META[s].label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="field-label">Notes / outcome</span>
            <textarea
              name="notes"
              rows={3}
              maxLength={5000}
              defaultValue={hearing?.notes ?? ""}
              className="field mt-1"
              placeholder="What happened, next steps, documents to bring…"
            />
          </label>

          {confirmDelete && hearing ? (
            <div role="alertdialog" aria-labelledby="del-h-title" className="rounded-md border border-red-200 bg-red-50 p-4">
              <p id="del-h-title" className="text-sm font-medium text-red-800">
                Delete the hearing on {formatKey(hearing.date, "d MMM yyyy")}?
              </p>
              <p className="mt-1 text-sm text-red-700">This can&apos;t be undone.</p>
              <div className="mt-3 flex justify-end gap-2">
                <button ref={keepRef} type="button" onClick={() => setConfirmDelete(false)} className="btn-secondary">
                  Keep it
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() =>
                    startDelete(async () => {
                      try {
                        const res = await deleteHearing(hearing.id);
                        if (res.ok) {
                          toast("Hearing deleted.");
                          onClose();
                          return;
                        }
                      } catch {
                        // fall through to the error toast
                      }
                      toast("Couldn't delete the hearing. Please try again.", "error");
                    })
                  }
                  className="btn-danger"
                >
                  {deleting ? "Deleting…" : "Delete hearing"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2 border-t border-border pt-4">
              {hearing ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="btn-ghost text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  Delete
                </button>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <button type="button" onClick={onClose} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={pending} className="btn-primary">
                  {pending ? "Saving…" : hearing ? "Save changes" : "Add hearing"}
                </button>
              </div>
            </div>
          )}
        </form>
      )}
    </Modal>
  );
}
