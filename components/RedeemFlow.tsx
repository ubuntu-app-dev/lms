"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type FocusEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import Link from "next/link";

/* -------------------------------------------------------------------------- */
/*  Config: edit these                                                         */
/* -------------------------------------------------------------------------- */

const BRAND = "LMS";
const PLAN_NAME = "Premium";

const PERKS = [
  "Every course, unlocked",
  "Quizzes, progress tracking and certificates",
  "Lessons you can download for offline study",
];

const ROUTES = {
  home: "/",
  studentLogin: "/student",
  subscribe: "/subscribe",
  support: "/support",
};

// Vouchers are 12 characters, shown in groups of 4: ABCD-EF23-GH45
const CODE_LENGTH = 12;
const GROUP = 4;

/* -------------------------------------------------------------------------- */
/*  Constants and helpers                                                      */
/* -------------------------------------------------------------------------- */

const DISPLAY = "font-[family-name:var(--font-display)]";

const GRID_BG: CSSProperties = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px)",
  backgroundSize: "32px 32px",
};

const FOCUS = "focus-visible:outline-none focus-visible:ring-4";

const PRIMARY_BTN = `inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#2347F4] px-5 py-3.5 text-center text-base font-semibold text-white transition-colors hover:bg-[#1B38C9] ${FOCUS} focus-visible:ring-[#2347F4]/30 disabled:cursor-not-allowed disabled:bg-[#2347F4]/70 motion-reduce:transition-none`;

type Step = "form" | "done";
type FieldName = "code" | "email";
type FormValues = Record<FieldName, string>;
type FormErrors = Partial<Record<FieldName, string>>;
type RedeemResult = { plan: string; accessUntil: string };

const FIELD_ORDER: FieldName[] = ["code", "email"];

/** Keep letters and numbers only, uppercase, and cap the length. */
function normalizeCode(raw: string) {
  return raw
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, CODE_LENGTH);
}

/** ABCDEF23GH45 -> ABCD-EF23-GH45 */
function formatCode(clean: string) {
  return clean.match(new RegExp(`.{1,${GROUP}}`, "g"))?.join("-") ?? "";
}

function validate(v: FormValues): FormErrors {
  const errors: FormErrors = {};
  const clean = normalizeCode(v.code);
  if (!clean) errors.code = "Enter your voucher code.";
  else if (clean.length < CODE_LENGTH)
    errors.code = `Voucher codes have ${CODE_LENGTH} characters. Check for missing ones.`;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim()))
    errors.email = "Enter a valid email, like you@school.edu.";
  return errors;
}

const REDEEM_ERRORS: Record<string, string> = {
  invalid: "We couldn't find that voucher. Check the code and try again.",
  used: "This voucher has already been redeemed.",
  expired:
    "This voucher has expired. Contact support if you think that's a mistake.",
};

/**
 * Replace the body with a real API call. Your server should check that the
 * voucher exists, is unused and not expired, then apply it to the account with
 * this email and return the new access end date.
 *
 * Throw `new Error("invalid" | "used" | "expired")` so the form can show a
 * clear message.
 */
async function redeemVoucher(values: FormValues): Promise<RedeemResult> {
  // const res = await fetch("/api/vouchers/redeem", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({
  //     code: normalizeCode(values.code),
  //     email: values.email.trim(),
  //   }),
  // });
  // if (!res.ok) {
  //   const { error } = await res.json();
  //   throw new Error(error);
  // }
  // return res.json();
  void values;
  await new Promise((r) => setTimeout(r, 900));
  const until = new Date();
  until.setDate(until.getDate() + 30);
  return { plan: PLAN_NAME, accessUntil: until.toISOString() };
}

/* -------------------------------------------------------------------------- */
/*  Icons                                                                      */
/* -------------------------------------------------------------------------- */

const ICONS = {
  cap: "M22 10v6M2 10l10-5 10 5-10 5z M6 12v5c3 3 9 3 12 0v-5",
  ticket:
    "M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z M13 5v2 M13 17v2 M13 11v2",
  check: "M20 6 9 17l-5-5",
  alert: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M12 8v4 M12 16h.01",
  arrowLeft: "M19 12H5 M12 19l-7-7 7-7",
};

function Icon({
  path,
  className = "h-5 w-5",
}: {
  path: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}

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

function SummaryRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="text-slate-600">{label}</dt>
      <dd className="min-w-0 break-words text-right font-medium">{children}</dd>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Voucher ticket preview (left panel)                                        */
/* -------------------------------------------------------------------------- */

function VoucherTicket({ code, step }: { code: string; step: Step }) {
  const clean = normalizeCode(code);
  const complete = clean.length === CODE_LENGTH;
  const status =
    step === "done"
      ? "Redeemed"
      : complete
        ? "Ready to redeem"
        : "Not redeemed";
  const display = formatCode(clean.padEnd(CODE_LENGTH, "·"));

  return (
    // Decorative mirror of the form, so it's hidden from assistive tech.
    <div
      aria-hidden="true"
      className="relative w-full max-w-md rounded-3xl bg-white text-[#0F1B3D] shadow-2xl shadow-[#0B1F8A]/40"
    >
      <div className="flex items-center justify-between gap-3 px-6 pt-6">
        <p className={`${DISPLAY} text-sm font-semibold text-[#2347F4]`}>
          {BRAND} voucher
        </p>
        <span className="rounded-full bg-[#FFD84A] px-3 py-1 text-xs font-semibold">
          {status}
        </span>
      </div>

      <div className="px-6 pb-7 pt-6">
        <p className="text-xs text-slate-500">Voucher code</p>
        <p
          className={`${DISPLAY} mt-1 text-2xl font-semibold tracking-wider sm:text-3xl ${
            clean ? "text-[#0F1B3D]" : "text-slate-300"
          }`}
        >
          {display}
        </p>
      </div>

      {/* Perforation */}
      <div className="relative">
        <div className="mx-6 border-t-2 border-dashed border-[#D5DBEE]" />
        <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-[#2347F4]" />
        <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-[#2347F4]" />
      </div>

      <div className="px-6 pb-6 pt-5">
        <p className="text-xs text-slate-500">Unlocks</p>
        <p className={`${DISPLAY} text-2xl font-semibold`}>
          {PLAN_NAME} access
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main component                                                             */
/* -------------------------------------------------------------------------- */

export default function RedeemFlow() {
  const [step, setStep] = useState<Step>("form");
  const [values, setValues] = useState<FormValues>({ code: "", email: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>(
    {},
  );
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [result, setResult] = useState<RedeemResult | null>(null);

  // Move focus to the new step's heading for keyboard and screen reader users.
  const headingRef = useRef<HTMLHeadingElement>(null);
  const prevStep = useRef<Step>(step);
  useEffect(() => {
    if (prevStep.current !== step) {
      prevStep.current = step;
      headingRef.current?.focus();
    }
  }, [step]);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const name = e.target.name as FieldName;
    const raw = e.target.value;
    // Store the code already formatted so it always reads ABCD-EF23-GH45.
    const value = name === "code" ? formatCode(normalizeCode(raw)) : raw;
    const next = { ...values, [name]: value };
    setValues(next);
    if (submitError) setSubmitError("");
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validate(next)[name] }));
    }
  }

  function handleBlur(e: FocusEvent<HTMLInputElement>) {
    const name = e.target.name as FieldName;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validate(values)[name] }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    setTouched({ code: true, email: true });

    const firstInvalid = FIELD_ORDER.find((n) => found[n]);
    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus();
      return;
    }

    setBusy(true);
    setSubmitError("");
    try {
      const res = await redeemVoucher(values);
      setResult(res);
      setStep("done");
    } catch (err) {
      const key = err instanceof Error ? err.message : "";
      setSubmitError(
        REDEEM_ERRORS[key] ??
          "We couldn't redeem your voucher. Check your connection and try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  function redeemAnother() {
    setValues({ code: "", email: values.email });
    setErrors({});
    setTouched({});
    setResult(null);
    setSubmitError("");
    setStep("form");
  }

  const inputClass = (error?: string) =>
    `mt-1.5 block w-full rounded-xl border bg-white px-4 py-3 text-base text-[#0F1B3D] transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-4 motion-reduce:transition-none ${
      error
        ? "border-red-500 focus:border-red-500 focus:ring-red-100"
        : "border-[#7B87AB] hover:border-[#4A5883] focus:border-[#2347F4] focus:ring-[#2347F4]/20"
    }`;

  const message = (id: FieldName, error: string | undefined, hint: string) =>
    error ? (
      <p
        id={`${id}-message`}
        className="mt-1.5 flex items-start gap-1.5 text-sm text-red-700"
      >
        <Icon path={ICONS.alert} className="mt-0.5 h-4 w-4 shrink-0" />
        {error}
      </p>
    ) : (
      <p id={`${id}-message`} className="mt-1.5 text-sm text-slate-500">
        {hint}
      </p>
    );

  const accessUntil = result
    ? new Date(result.accessUntil).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      {/* ------------------------------ Left panel ------------------------------ */}
      <aside
        className="relative bg-[#2347F4] px-6 py-7 text-white sm:px-10 lg:flex lg:flex-col lg:px-14 lg:py-12"
        style={GRID_BG}
      >
        <Link
          href={ROUTES.home}
          className={`inline-flex w-fit items-center gap-2.5 rounded-lg ${FOCUS} focus-visible:ring-white/40`}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#2347F4]">
            <Icon path={ICONS.cap} />
          </span>
          <span className={`${DISPLAY} text-xl font-semibold tracking-tight`}>
            {BRAND}
          </span>
        </Link>

        <div className="mt-8 max-w-md lg:mt-14">
          <h1
            className={`${DISPLAY} text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl`}
          >
            Got a voucher? Turn it into access.
          </h1>
          <p className="mt-3 text-base text-blue-100 lg:text-lg">
            Enter your code and the email you use for {BRAND}. Your courses
            unlock right away.
          </p>
        </div>

        <div className="mt-10 hidden lg:block">
          <VoucherTicket code={values.code} step={step} />
        </div>

        <ul className="mt-auto hidden space-y-2.5 pt-10 text-blue-50 lg:block">
          {PERKS.map((perk) => (
            <li key={perk} className="flex items-center gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FFD84A] text-[#0F1B3D]">
                <Icon path={ICONS.check} className="h-3 w-3" />
              </span>
              {perk}
            </li>
          ))}
        </ul>
      </aside>

      {/* ------------------------------ Right panel ----------------------------- */}
      <section className="flex justify-center px-4 py-8 sm:px-8 lg:items-center lg:py-14">
        <div className="w-full max-w-lg">
          <Link
            href={ROUTES.home}
            className={`-ml-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-[#0F1B3D] ${FOCUS} focus-visible:ring-[#2347F4]/25`}
          >
            <Icon path={ICONS.arrowLeft} className="h-4 w-4" />
            Back to home
          </Link>

          <div className="mt-3 rounded-2xl border border-[#D5DBEE] bg-white p-6 shadow-sm sm:p-8">
            {/* ---------------------------- Form ---------------------------- */}
            {step === "form" && (
              <>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2347F4] text-white">
                  <Icon path={ICONS.ticket} className="h-6 w-6" />
                </span>
                <h2
                  ref={headingRef}
                  tabIndex={-1}
                  className={`${DISPLAY} mt-5 text-2xl font-semibold tracking-tight focus:outline-none`}
                >
                  Redeem voucher
                </h2>
                <p className="mt-1.5 text-slate-600">
                  Enter the code from your voucher. Each code works once.
                </p>

                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className="mt-7 space-y-5"
                >
                  <div>
                    <label htmlFor="code" className="block text-sm font-medium">
                      Voucher code
                    </label>
                    <input
                      id="code"
                      name="code"
                      type="text"
                      autoComplete="off"
                      autoCapitalize="characters"
                      autoCorrect="off"
                      spellCheck={false}
                      placeholder="ABCD-EF23-GH45"
                      value={values.code}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      aria-invalid={errors.code ? true : undefined}
                      aria-describedby="code-message"
                      className={`${inputClass(errors.code)} font-mono tracking-widest`}
                    />
                    {message("code", errors.code, "Dashes are added for you.")}
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="you@school.edu"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      aria-invalid={errors.email ? true : undefined}
                      aria-describedby="email-message"
                      className={inputClass(errors.email)}
                    />
                    {message(
                      "email",
                      errors.email,
                      "The voucher is added to the account with this email.",
                    )}
                  </div>

                  {submitError && (
                    <p
                      role="alert"
                      className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800"
                    >
                      <Icon
                        path={ICONS.alert}
                        className="mt-0.5 h-4 w-4 shrink-0"
                      />
                      {submitError}
                    </p>
                  )}

                  <button type="submit" disabled={true} className={PRIMARY_BTN}>
                    {busy ? (
                      <>
                        <Spinner />
                        Redeeming…
                      </>
                    ) : (
                      "Redeem voucher"
                    )}
                  </button>
                </form>
              </>
            )}

            {/* ---------------------------- Done ---------------------------- */}
            {step === "done" && result && (
              <>
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2347F4] text-white">
                  <Icon path={ICONS.check} className="h-6 w-6" />
                </span>
                <h2
                  ref={headingRef}
                  tabIndex={-1}
                  className={`${DISPLAY} mt-5 text-2xl font-semibold tracking-tight focus:outline-none`}
                >
                  Voucher redeemed
                </h2>
                <p className="mt-1.5 text-slate-600">
                  Your {result.plan} access is active. Log in with{" "}
                  <span className="font-semibold text-[#0F1B3D]">
                    {values.email}
                  </span>{" "}
                  to start learning.
                </p>

                <dl className="mt-6 divide-y divide-[#E3E7F4] rounded-xl bg-[#F7F8FD] px-4 text-sm">
                  <SummaryRow label="Plan">{result.plan}</SummaryRow>
                  <SummaryRow label="Access until">{accessUntil}</SummaryRow>
                  <SummaryRow label="Voucher">
                    <span className="tracking-wide">{values.code}</span>
                  </SummaryRow>
                </dl>

                <Link
                  href={ROUTES.studentLogin}
                  className={`${PRIMARY_BTN} mt-6`}
                >
                  Log in as a student
                </Link>
                <button
                  type="button"
                  onClick={redeemAnother}
                  className={`mt-3 w-full rounded-xl px-5 py-3 text-base font-semibold text-[#2347F4] hover:bg-[#2347F4]/10 ${FOCUS} focus-visible:ring-[#2347F4]/25`}
                >
                  Redeem another voucher
                </button>
              </>
            )}
          </div>

          <div className="mt-5 space-y-2 text-center text-sm text-slate-600">
            <p>
              No voucher?{" "}
              <Link
                href={ROUTES.subscribe}
                className={`rounded font-medium text-[#2347F4] underline-offset-4 hover:underline ${FOCUS} focus-visible:ring-[#2347F4]/25`}
              >
                Subscribe instead
              </Link>
            </p>
            <p>
              Need help?{" "}
              <Link
                href={ROUTES.support}
                className={`rounded font-medium text-[#2347F4] underline-offset-4 hover:underline ${FOCUS} focus-visible:ring-[#2347F4]/25`}
              >
                Contact support
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
