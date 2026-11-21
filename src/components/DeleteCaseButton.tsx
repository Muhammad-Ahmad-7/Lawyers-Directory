"use client";

import { useState, useTransition } from "react";
import Modal from "./Modal";
import { useToast } from "./Toaster";
import { deleteCase } from "@/app/(app)/cases/actions";

export default function DeleteCaseButton({ id, title, hearingCount }: { id: string; title: string; hearingCount: number }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const toast = useToast();

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-secondary text-red-600 hover:bg-red-50">
        Delete
      </button>
      {open && (
        <Modal title="Delete case?" onClose={() => setOpen(false)}>
          <p className="text-sm text-slate-600">
            <span className="font-medium text-foreground">&ldquo;{title}&rdquo;</span>
            {hearingCount > 0
              ? ` and its ${hearingCount} ${hearingCount === 1 ? "hearing" : "hearings"} will be deleted.`
              : " will be deleted."}{" "}
            This can&apos;t be undone.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" autoFocus onClick={() => setOpen(false)} className="btn-secondary">
              Keep it
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  // On success the action redirects to /cases.
                  const res = await deleteCase(id);
                  if (!res?.ok) toast("Couldn't delete the case. Please try again.", "error");
                })
              }
              className="btn-danger"
            >
              {pending ? "Deleting…" : "Delete case"}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
