"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FOCUS } from "@/data/data";
import { logoutAction } from "@/actions/auth/logout";
import CodeForm from "@/components/redeem/CodeForm";

/**
 * A modal that opens as soon as a student who hasn't enrolled lands on the
 * dashboard. Unlike the dialog in AccountMenu it can't be closed: no close
 * button, Esc is ignored, and clicking the backdrop does nothing. It goes away
 * only when the class code is accepted and the page refreshes.
 */
export default function EnrollmentGate() {
  const router = useRouter();
  const uid = useId();
  const titleId = `${uid}-title`;
  const descId = `${uid}-desc`;

  const dialogRef = useRef<HTMLDialogElement>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    dialog?.querySelector<HTMLElement>("[data-autofocus]")?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    setLogoutError("");
    try {
      await logoutAction();
    } catch {
      setLogoutError("We couldn't log you out. Try again.");
      setLoggingOut(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descId}
      // Esc fires a "cancel" event on a native dialog: ignore it.
      onCancel={(e) => e.preventDefault()}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl border border-[#D5DBEE] bg-white p-0 text-[#0F1B3D] shadow-2xl backdrop:bg-[#0F1B3D]/70"
    >
      <div className="p-6 sm:p-8">
        <CodeForm
          kind="classCode"
          headingId={titleId}
          descriptionId={descId}
          // No onCancel on purpose: CodeForm then shows no Cancel button.
          // After the "You're enrolled" message, the button re-runs the page
          // on the server. The student is now enrolled, so the gate is no
          // longer rendered and the lessons open up.
          doneLabel="Start learning"
          onDone={() => router.refresh()}
        />

        <div className="mt-6 border-t border-[#E3E7F4] pt-4 text-center text-sm text-slate-600">
          Wrong account?{" "}
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className={`rounded font-medium text-[#2347F4] underline-offset-4 hover:underline disabled:opacity-70 ${FOCUS}`}
          >
            {loggingOut ? "Logging out…" : "Log out"}
          </button>
          {logoutError && (
            <p role="alert" className="mt-2 text-red-700">
              {logoutError}
            </p>
          )}
        </div>
      </div>
    </dialog>
  );
}
