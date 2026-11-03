"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { Icon } from "@/components/icon/Icon";
import { BTN_PRIMARY, BTN_SECONDARY, DISPLAY } from "@/data/data";
import { enrollWithClassCode as enrollAction } from "@/actions/enroll";

/* -------------------------------------------------------------------------- */
/*  Backend hooks                                                              */
/*  Throw an Error with a friendly message to show it under the input.        */
/* -------------------------------------------------------------------------- */

export type CodeResult = { title: string; message: string };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// STILL A STUB: this waits and says yes without saving anything.
async function redeemVoucher(code: string): Promise<CodeResult> {
  // const res = await fetch("/api/vouchers/redeem", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ code }),
  // });
  // const data = await res.json();
  // if (!res.ok) throw new Error(data.message ?? "That voucher didn't work.");
  // return { title: "Voucher redeemed", message: data.message };
  await sleep(900);
  return {
    title: "Voucher redeemed",
    message: `Code ${code} was applied to your account.`,
  };
}

// REAL: checks the code against the classes table and saves the enrollment.
async function enrollWithClassCode(code: string): Promise<CodeResult> {
  const res = await enrollAction(code);
  if (!res.ok) throw new Error(res.message);
  return {
    title: res.alreadyEnrolled ? "You're already enrolled" : "You're enrolled",
    message: `You joined ${res.className}. Your lessons are now open.`,
  };
}

/* -------------------------------------------------------------------------- */
/*  Config                                                                     */
/* -------------------------------------------------------------------------- */

export const CODE_ICONS = {
  ticket:
    "M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z M13 5v2 M13 17v2 M13 11v2",
  users:
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  check: "M20 6 9 17l-5-5",
};

export const CODE_KINDS = {
  voucher: {
    title: "Redeem a voucher",
    description: "Enter the code on your voucher to add it to your account.",
    label: "Voucher code",
    placeholder: "e.g. ABCD-1234",
    emptyError: "Enter your voucher code.",
    submit: "Redeem voucher",
    busy: "Redeeming…",
    icon: CODE_ICONS.ticket,
    tile: "bg-[#FFEFC7] text-[#7A5200]",
    run: redeemVoucher,
  },
  classCode: {
    title: "Enroll with a class code",
    description:
      "Ask your teacher for the class code, then enter it here to join their class.",
    label: "Class code",
    placeholder: "e.g. JAVA-7K2M",
    emptyError: "Enter your class code.",
    submit: "Join class",
    busy: "Joining…",
    icon: CODE_ICONS.users,
    tile: "bg-[#E4EAFF] text-[#2347F4]",
    run: enrollWithClassCode,
  },
} as const;

export type CodeKind = keyof typeof CODE_KINDS;

/** Uppercase, letters, digits and hyphens only. Also used for ?code= prefill. */
export function normalizeCode(value: string) {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "")
    .slice(0, 32);
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

function Spinner() {
  return (
    <svg
      className="h-5 w-5 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeOpacity=".3"
        strokeWidth="3"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

type CodeFormProps = {
  kind: CodeKind;
  initialCode?: string;
  /** Focus the input on mount (the modal does this itself) */
  autoFocus?: boolean;
  /** Let a wrapper (e.g. a dialog) point aria-labelledby / describedby at these */
  headingId?: string;
  descriptionId?: string;
  /** When given, a Cancel button is shown (modal use) */
  onCancel?: () => void;
  /** Called once when the code is accepted */
  onSuccess?: () => void;
  /** After success: a button that calls onDone, or a link if doneHref is set */
  onDone?: () => void;
  doneHref?: string;
  doneLabel?: string;
  /** After success: show an "Enter another code" button */
  allowAnother?: boolean;
};

export default function CodeForm({
  kind,
  initialCode = "",
  autoFocus = false,
  headingId,
  descriptionId,
  onCancel,
  onSuccess,
  onDone,
  doneHref,
  doneLabel = "Done",
  allowAnother = false,
}: CodeFormProps) {
  const cfg = CODE_KINDS[kind];
  const uid = useId();
  const titleId = headingId ?? `${uid}-title`;
  const descId = descriptionId ?? `${uid}-desc`;
  const inputId = `${uid}-input`;
  const errorId = `${uid}-error`;

  const inputRef = useRef<HTMLInputElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const [code, setCode] = useState(normalizeCode(initialCode));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<CodeResult | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  // Announce the success message by moving focus to the heading
  useEffect(() => {
    if (result) headingRef.current?.focus();
  }, [result]);

  // After "Enter another code", put the cursor back in the field
  useEffect(() => {
    if (attempt > 0) inputRef.current?.focus();
  }, [attempt]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!code) {
      setError(cfg.emptyError);
      inputRef.current?.focus();
      return;
    }
    if (code.length < 4) {
      setError("That code looks too short. Check it and try again.");
      inputRef.current?.focus();
      return;
    }

    setBusy(true);
    setError("");
    try {
      const res = await cfg.run(code);
      setResult(res);
      onSuccess?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Try again.",
      );
      inputRef.current?.focus();
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setResult(null);
    setCode("");
    setError("");
    setAttempt((a) => a + 1);
  }

  const inDialog = Boolean(onCancel);

  return (
    <div>
      <span
        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
          result ? "bg-[#DDF3E8] text-[#0B6B42]" : cfg.tile
        }`}
      >
        <Icon path={result ? CODE_ICONS.check : cfg.icon} className="h-6 w-6" />
      </span>

      <h2
        ref={headingRef}
        id={titleId}
        tabIndex={-1}
        className={`${DISPLAY} mt-5 text-2xl font-semibold tracking-tight focus:outline-none`}
      >
        {result ? result.title : cfg.title}
      </h2>
      <p id={descId} className="mt-1.5 text-slate-600">
        {result ? result.message : cfg.description}
      </p>

      {result ? (
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
          {allowAnother && (
            <button
              type="button"
              onClick={reset}
              className={`${BTN_SECONDARY} w-full sm:w-auto`}
            >
              Enter another code
            </button>
          )}
          {doneHref ? (
            <Link href={doneHref} className={`${BTN_PRIMARY} w-full sm:w-auto`}>
              {doneLabel}
            </Link>
          ) : onDone ? (
            <button
              type="button"
              onClick={onDone}
              className={`${BTN_PRIMARY} w-full sm:w-auto`}
            >
              {doneLabel}
            </button>
          ) : null}
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="mt-6">
          <label htmlFor={inputId} className="block text-sm font-medium">
            {cfg.label}
          </label>
          <input
            ref={inputRef}
            id={inputId}
            data-autofocus
            value={code}
            onChange={(e) => {
              setCode(normalizeCode(e.target.value));
              if (error) setError("");
            }}
            type="text"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            maxLength={32}
            placeholder={cfg.placeholder}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className={`mt-1.5 block w-full rounded-xl border bg-white px-4 py-3 text-base uppercase tracking-[0.12em] text-[#0F1B3D] transition-colors placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-400 focus:outline-none focus:ring-4 motion-reduce:transition-none ${
              error
                ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                : "border-[#7B87AB] hover:border-[#4A5883] focus:border-[#2347F4] focus:ring-[#2347F4]/20"
            }`}
          />
          {error && (
            <p
              id={errorId}
              role="alert"
              className="mt-1.5 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <div
            className={`mt-6 flex flex-col-reverse gap-3 ${
              inDialog ? "sm:flex-row sm:justify-end" : ""
            }`}
          >
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className={`${BTN_SECONDARY} w-full sm:w-auto`}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={busy}
              className={`${BTN_PRIMARY} w-full disabled:cursor-not-allowed disabled:opacity-70 ${
                inDialog ? "sm:w-auto" : ""
              }`}
            >
              {busy ? (
                <>
                  <Spinner />
                  {cfg.busy}
                </>
              ) : (
                cfg.submit
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
