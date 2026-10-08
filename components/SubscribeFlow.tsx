"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type FocusEvent,
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";

/* -------------------------------------------------------------------------- */
/*  Config: edit these                                                         */
/* -------------------------------------------------------------------------- */

const BRAND = "LMS";

const PLAN = {
  name: "Premium",
  price: 499,
  currency: "PHP",
};

const PERKS = [
  "Every course, unlocked",
  "Quizzes, progress tracking and certificates",
  "Lessons you can download for offline study",
];

// Where the QR code points. Replace with your payment provider's checkout URL
// or QR payload. If you already have a fixed merchant QR (bank or e-wallet),
// drop the image in /public and set STATIC_QR_SRC, e.g. "/payment-qr.png".
const PAYMENT_URL = "https://pay.example.com/checkout";
const STATIC_QR_SRC: string | null = null;

const QR_LIFETIME_SECONDS = 15 * 60;

/* -------------------------------------------------------------------------- */
/*  Constants and helpers                                                      */
/* -------------------------------------------------------------------------- */

const PRICE_LABEL = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: PLAN.currency,
}).format(PLAN.price);

const DISPLAY = "font-[family-name:var(--font-display)]";

const GRID_BG: CSSProperties = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px)",
  backgroundSize: "32px 32px",
};

const PRIMARY_BTN =
  "inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#2347F4] px-5 py-3.5 text-center text-base font-semibold text-white transition-colors hover:bg-[#1B38C9] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2347F4]/30 disabled:cursor-not-allowed disabled:bg-[#2347F4]/70 motion-reduce:transition-none";

type Step = "details" | "payment" | "done";
type FieldName = "fullName" | "course" | "school" | "email";
type FormValues = Record<FieldName, string>;
type FormErrors = Partial<Record<FieldName, string>>;

const FIELD_ORDER: FieldName[] = ["fullName", "course", "school", "email"];

function validate(v: FormValues): FormErrors {
  const errors: FormErrors = {};
  if (v.fullName.trim().length < 2) errors.fullName = "Enter your full name.";
  if (!v.course.trim()) errors.course = "Enter your course.";
  if (!v.school.trim()) errors.school = "Enter your school.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim()))
    errors.email = "Enter a valid email, like you@school.edu.";
  return errors;
}

function formatTime(total: number) {
  const m = String(Math.floor(total / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${m}:${s}`;
}

/**
 * Replace the body with a real API call. Your server should save the
 * subscriber, create a payment reference, and return it.
 */
async function createSubscription(
  values: FormValues,
): Promise<{ reference: string }> {
  // const res = await fetch("/api/subscribe", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(values),
  // });
  // if (!res.ok) throw new Error("Request failed");
  // return res.json();
  void values;
  await new Promise((r) => setTimeout(r, 900));
  return {
    reference: `LMS-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
  };
}

/* -------------------------------------------------------------------------- */
/*  Icons                                                                      */
/* -------------------------------------------------------------------------- */

const ICONS = {
  cap: "M22 10v6M2 10l10-5 10 5-10 5z M6 12v5c3 3 9 3 12 0v-5",
  check: "M20 6 9 17l-5-5",
  clock: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M12 6v6l4 2",
  arrowLeft: "M19 12H5 M12 19l-7-7 7-7",
  alert: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M12 8v4 M12 16h.01",
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

/* -------------------------------------------------------------------------- */
/*  Small building blocks                                                      */
/* -------------------------------------------------------------------------- */

type FieldProps = {
  id: FieldName;
  label: string;
  hint?: string;
  error?: string;
} & InputHTMLAttributes<HTMLInputElement>;

function Field({ id, label, hint, error, ...props }: FieldProps) {
  const messageId = `${id}-message`;
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? messageId : undefined}
        className={`mt-1.5 block w-full rounded-xl border bg-white px-4 py-3 text-base text-[#0F1B3D] transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-4 motion-reduce:transition-none ${
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-100"
            : "border-[#7B87AB] hover:border-[#4A5883] focus:border-[#2347F4] focus:ring-[#2347F4]/20"
        }`}
        {...props}
      />
      {(error || hint) && (
        <p
          id={messageId}
          className={`mt-1.5 flex items-start gap-1.5 text-sm ${
            error ? "text-red-700" : "text-slate-500"
          }`}
        >
          {error && (
            <Icon path={ICONS.alert} className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          {error ?? hint}
        </p>
      )}
    </div>
  );
}

const STEPS: { key: Step; label: string }[] = [
  { key: "details", label: "Your details" },
  { key: "payment", label: "Payment" },
  { key: "done", label: "Confirmation" },
];

function Progress({ current }: { current: Step }) {
  const idx = STEPS.findIndex((s) => s.key === current);
  return (
    <ol className="grid grid-cols-3 gap-2" aria-label="Subscription progress">
      {STEPS.map((s, i) => (
        <li key={s.key} aria-current={i === idx ? "step" : undefined}>
          <div
            className={`h-1.5 rounded-full transition-colors motion-reduce:transition-none ${
              i <= idx ? "bg-[#2347F4]" : "bg-[#D5DBEE]"
            }`}
          />
          <p
            className={`mt-2 text-sm ${
              i === idx ? "font-semibold" : "text-slate-500"
            }`}
          >
            {i + 1}. {s.label}
            {i < idx && <span className="sr-only"> (completed)</span>}
          </p>
        </li>
      ))}
    </ol>
  );
}

function SummaryRow({
  label,
  children,
  strong = false,
}: {
  label: string;
  children: ReactNode;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="text-slate-600">{label}</dt>
      <dd
        className={`min-w-0 break-words text-right ${
          strong ? `${DISPLAY} text-lg font-semibold` : "font-medium"
        }`}
      >
        {children}
      </dd>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  The live pass preview (left panel)                                         */
/* -------------------------------------------------------------------------- */

const BARS = [2, 1, 3, 1, 2, 3, 1, 1, 3, 2, 1, 2, 3, 1, 2, 1, 3, 2];

function PassRow({
  label,
  value,
  placeholder,
  large = false,
}: {
  label: string;
  value: string;
  placeholder: string;
  large?: boolean;
}) {
  const filled = value.trim().length > 0;
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd
        className={`mt-0.5 truncate ${
          large ? `${DISPLAY} text-2xl font-semibold` : "text-base font-medium"
        } ${filled ? "text-[#0F1B3D]" : "text-slate-300"}`}
      >
        {filled ? value.trim() : placeholder}
      </dd>
    </div>
  );
}

function PassPreview({ values, step }: { values: FormValues; step: Step }) {
  const status =
    step === "details"
      ? "Draft"
      : step === "payment"
        ? "Awaiting payment"
        : "Pending verification";

  return (
    // Decorative mirror of the form, so it's hidden from assistive tech.
    <div
      aria-hidden="true"
      className="relative w-full max-w-md rounded-3xl bg-white text-[#0F1B3D] shadow-2xl shadow-[#0B1F8A]/40"
    >
      <div className="flex items-center justify-between gap-3 px-6 pt-6">
        <p className={`${DISPLAY} text-sm font-semibold text-[#2347F4]`}>
          {BRAND} {PLAN.name} pass
        </p>
        <span className="rounded-full bg-[#FFD84A] px-3 py-1 text-xs font-semibold">
          {status}
        </span>
      </div>

      <dl className="space-y-4 px-6 pb-7 pt-6">
        <PassRow
          label="Name"
          value={values.fullName}
          placeholder="Your full name"
          large
        />
        <PassRow
          label="Course"
          value={values.course}
          placeholder="Your course"
        />
        <PassRow
          label="School"
          value={values.school}
          placeholder="Your school"
        />
      </dl>

      {/* Perforation */}
      <div className="relative">
        <div className="mx-6 border-t-2 border-dashed border-[#D5DBEE]" />
        <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-[#2347F4]" />
        <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-[#2347F4]" />
      </div>

      <div className="flex items-end justify-between px-6 pb-6 pt-5">
        <div>
          <p className="text-xs text-slate-500">Promo plan</p>
          <p className={`${DISPLAY} text-2xl font-semibold`}>{PRICE_LABEL}</p>
        </div>
        <div className="flex h-10 items-stretch gap-[2px]">
          {BARS.map((w, i) => (
            <span key={i} className="bg-[#0F1B3D]" style={{ width: w * 2 }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  QR frame                                                                   */
/* -------------------------------------------------------------------------- */

function QrFrame({
  value,
  expired,
  busy,
  onRefresh,
}: {
  value: string;
  expired: boolean;
  busy: boolean;
  onRefresh: () => void;
}) {
  const corner = "absolute h-7 w-7 border-[#2347F4]";
  return (
    <div className="relative rounded-2xl bg-white p-5">
      <span
        className={`${corner} left-0 top-0 rounded-tl-xl border-l-4 border-t-4`}
      />
      <span
        className={`${corner} right-0 top-0 rounded-tr-xl border-r-4 border-t-4`}
      />
      <span
        className={`${corner} bottom-0 left-0 rounded-bl-xl border-b-4 border-l-4`}
      />
      <span
        className={`${corner} bottom-0 right-0 rounded-br-xl border-b-4 border-r-4`}
      />

      <div
        role="img"
        aria-label="QR code for your payment"
        className={`h-48 w-48 sm:h-56 sm:w-56 ${expired ? "opacity-20" : ""}`}
      >
        {STATIC_QR_SRC ? (
          <Image
            src={STATIC_QR_SRC}
            alt=""
            width={224}
            height={224}
            className="h-full w-full object-contain"
          />
        ) : (
          <QRCodeSVG
            value={value}
            size={224}
            level="M"
            style={{ width: "100%", height: "100%" }}
          />
        )}
      </div>

      {expired && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl bg-white/85 p-4 text-center backdrop-blur-sm">
          <p className="font-semibold">This QR code has expired</p>
          <button
            type="button"
            onClick={onRefresh}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-lg bg-[#2347F4] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1B38C9] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2347F4]/30 disabled:opacity-70"
          >
            {busy && <Spinner />}
            Get a new QR code
          </button>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main component                                                             */
/* -------------------------------------------------------------------------- */

export default function SubscribeFlow() {
  const [step, setStep] = useState<Step>("details");
  const [values, setValues] = useState<FormValues>({
    fullName: "",
    course: "",
    school: "",
    email: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>(
    {},
  );
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [reference, setReference] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(QR_LIFETIME_SECONDS);
  const [copied, setCopied] = useState(false);

  // Move focus to the new step's heading so keyboard and screen reader users
  // land in the right place.
  const headingRef = useRef<HTMLHeadingElement>(null);
  const prevStep = useRef<Step>(step);
  useEffect(() => {
    if (prevStep.current !== step) {
      prevStep.current = step;
      headingRef.current?.focus();
    }
  }, [step]);

  // QR expiry countdown
  useEffect(() => {
    if (step !== "payment") return;
    const id = window.setInterval(
      () => setSecondsLeft((s) => Math.max(0, s - 1)),
      1000,
    );
    return () => window.clearInterval(id);
  }, [step]);

  const expired = secondsLeft === 0;
  const qrValue = `${PAYMENT_URL}?ref=${encodeURIComponent(reference)}&amount=${PLAN.price}`;
  const firstName = values.fullName.trim().split(" ")[0];

  /* ---- form handlers ---- */

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const name = e.target.name as FieldName;
    const next = { ...values, [name]: e.target.value };
    setValues(next);
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validate(next)[name] }));
    }
  }

  function handleBlur(e: FocusEvent<HTMLInputElement>) {
    const name = e.target.name as FieldName;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validate(values)[name] }));
  }

  const bind = (name: FieldName) => ({
    id: name,
    name,
    value: values[name],
    onChange: handleChange,
    onBlur: handleBlur,
    error: errors[name],
  });

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    setTouched({ fullName: true, course: true, school: true, email: true });

    const firstInvalid = FIELD_ORDER.find((n) => found[n]);
    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus();
      return;
    }

    setBusy(true);
    setSubmitError("");
    try {
      const result = await createSubscription(values);
      setReference(result.reference);
      setSecondsLeft(QR_LIFETIME_SECONDS);
      setStep("payment");
    } catch {
      setSubmitError(
        "We couldn't prepare your QR code. Check your connection and try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleRefreshQr() {
    setBusy(true);
    setSubmitError("");
    try {
      const result = await createSubscription(values);
      setReference(result.reference);
      setSecondsLeft(QR_LIFETIME_SECONDS);
    } catch {
      setSubmitError(
        "We couldn't create a new QR code. Try again in a moment.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function copyReference() {
    try {
      await navigator.clipboard.writeText(reference);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable; the reference is still visible on screen */
    }
  }

  function handlePaid() {
    // TODO: tell your backend the learner says they've paid, then verify the
    // payment (webhook or manual check) before unlocking access.
    setStep("done");
  }

  const referenceRow = (
    <SummaryRow label="Reference">
      <span className="inline-flex items-center gap-3">
        <span className="tracking-wide">{reference}</span>
        <button
          type="button"
          onClick={copyReference}
          className="rounded-md px-2 py-1 text-sm font-semibold text-[#2347F4] hover:bg-[#2347F4]/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2347F4]/25"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </span>
    </SummaryRow>
  );

  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      {/* ------------------------------ Left panel ------------------------------ */}
      <aside
        className="relative bg-[#2347F4] px-6 py-7 text-white sm:px-10 lg:flex lg:flex-col lg:px-14 lg:py-12"
        style={GRID_BG}
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#2347F4]">
            <Icon path={ICONS.cap} />
          </span>
          <span className={`${DISPLAY} text-xl font-semibold tracking-tight`}>
            {BRAND}
          </span>
        </div>

        <div className="mt-8 max-w-md lg:mt-14">
          <h1
            className={`${DISPLAY} text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl`}
          >
            Get full access to every course
          </h1>
          <p className="mt-3 text-base text-blue-100 lg:text-lg">
            Tell us who you are, pay with a quick scan, and start learning.
          </p>
          <p className="mt-5 inline-block rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium lg:hidden">
            {PLAN.name} plan: {PRICE_LABEL} per month
          </p>
        </div>

        <div className="mt-10 hidden lg:block">
          <PassPreview values={values} step={step} />
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
          <Progress current={step} />

          <div className="mt-6 rounded-2xl border border-[#D5DBEE] bg-white p-6 shadow-sm sm:p-8">
            {/* ----------------------------- Step 1 ----------------------------- */}
            {step === "details" && (
              <>
                <h2
                  ref={headingRef}
                  tabIndex={-1}
                  className={`${DISPLAY} text-2xl font-semibold tracking-tight focus:outline-none`}
                >
                  Your details
                </h2>
                <p className="mt-1.5 text-slate-600">
                  We&apos;ll use these to set up your pass. All fields are
                  required.
                </p>

                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className="mt-7 space-y-5"
                >
                  <Field
                    {...bind("fullName")}
                    label="Full name"
                    type="text"
                    autoComplete="name"
                    placeholder="Alex Rivera"
                    required
                  />
                  <Field
                    {...bind("course")}
                    label="Course"
                    hint="The program you're enrolled in."
                    type="text"
                    autoComplete="off"
                    placeholder="e.g. Computer Science"
                    required
                  />
                  <Field
                    {...bind("school")}
                    label="School"
                    type="text"
                    autoComplete="organization"
                    placeholder="e.g. Riverside University"
                    required
                  />
                  <Field
                    {...bind("email")}
                    label="Email"
                    hint="Your receipt and access details are sent here."
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="you@school.edu"
                    required
                  />

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

                  <button type="submit" disabled={busy} className={PRIMARY_BTN}>
                    {busy ? (
                      <>
                        <Spinner />
                        Preparing your QR code…
                      </>
                    ) : (
                      "Get payment QR code"
                    )}
                  </button>
                </form>
              </>
            )}

            {/* ----------------------------- Step 2 ----------------------------- */}
            {step === "payment" && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitError("");
                    setStep("details");
                  }}
                  className="-ml-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-[#0F1B3D] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2347F4]/25"
                >
                  <Icon path={ICONS.arrowLeft} className="h-4 w-4" />
                  Edit details
                </button>

                <h2
                  ref={headingRef}
                  tabIndex={-1}
                  className={`${DISPLAY} mt-3 text-2xl font-semibold tracking-tight focus:outline-none`}
                >
                  Scan to pay
                </h2>
                <p className="mt-1.5 text-slate-600">
                  Almost there{firstName ? `, ${firstName}` : ""}. Open your
                  banking or e-wallet app, scan the code, and confirm{" "}
                  {PRICE_LABEL}.
                </p>

                <div className="mt-6 flex flex-col items-center">
                  <QrFrame
                    value={qrValue}
                    expired={expired}
                    busy={busy}
                    onRefresh={handleRefreshQr}
                  />
                  <p
                    className={`mt-4 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium ${
                      expired
                        ? "bg-red-50 text-red-800"
                        : secondsLeft < 60
                          ? "bg-amber-50 text-amber-900"
                          : "bg-[#F2F4FB] text-slate-700"
                    }`}
                  >
                    <Icon path={ICONS.clock} className="h-4 w-4" />
                    {expired
                      ? "Expired"
                      : `Valid for ${formatTime(secondsLeft)}`}
                  </p>
                </div>

                {submitError && (
                  <p
                    role="alert"
                    className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800"
                  >
                    <Icon
                      path={ICONS.alert}
                      className="mt-0.5 h-4 w-4 shrink-0"
                    />
                    {submitError}
                  </p>
                )}

                <dl className="mt-6 divide-y divide-[#E3E7F4] rounded-xl bg-[#F7F8FD] px-4 text-sm">
                  <SummaryRow label="Plan">{PLAN.name}, monthly</SummaryRow>
                  <SummaryRow label="Amount due" strong>
                    {PRICE_LABEL}
                  </SummaryRow>
                  {referenceRow}
                </dl>

                <button
                  type="button"
                  onClick={handlePaid}
                  disabled={expired}
                  className={`${PRIMARY_BTN} mt-6`}
                >
                  I&apos;ve completed payment
                </button>
                <p className="mt-3 text-center text-sm text-slate-500">
                  Add the reference as a note if your app asks for one.
                </p>
              </>
            )}

            {/* ----------------------------- Step 3 ----------------------------- */}
            {step === "done" && (
              <>
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2347F4] text-white">
                  <Icon path={ICONS.check} className="h-6 w-6" />
                </span>
                <h2
                  ref={headingRef}
                  tabIndex={-1}
                  className={`${DISPLAY} mt-5 text-2xl font-semibold tracking-tight focus:outline-none`}
                >
                  Payment submitted
                </h2>
                <p className="mt-1.5 text-slate-600">
                  We&apos;re checking your payment. We&apos;ll email your access
                  details to{" "}
                  <span className="font-semibold text-[#0F1B3D]">
                    {values.email}
                  </span>{" "}
                  as soon as it&apos;s confirmed.
                </p>

                <dl className="mt-6 divide-y divide-[#E3E7F4] rounded-xl bg-[#F7F8FD] px-4 text-sm">
                  <SummaryRow label="Plan">{PLAN.name}, monthly</SummaryRow>
                  <SummaryRow label="Reference">
                    <span className="tracking-wide">{reference}</span>
                  </SummaryRow>
                </dl>

                {/* Change to wherever learners should land after subscribing */}
                <Link href="/dashboard" className={`${PRIMARY_BTN} mt-6`}>
                  Go to my dashboard
                </Link>
              </>
            )}
          </div>

          <p className="mt-5 text-center text-sm text-slate-500">
            Need help?{" "}
            <Link
              href="/support"
              className="font-medium text-[#2347F4] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2347F4]/25"
            >
              Contact support
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
