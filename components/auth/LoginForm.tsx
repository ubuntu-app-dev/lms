"use client";

import {
  useEffect,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type FocusEvent,
  type FormEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sendLoginCode, verifyLoginCode } from "@/actions/auth/auth";

/* -------------------------------------------------------------------------- */
/*  Config: edit these                                                         */
/* -------------------------------------------------------------------------- */

const BRAND = "LMS";
const CODE_LENGTH = 6;
const RESEND_SECONDS = 60;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
type Role = "student" | "teacher";

const ROLES = {
  student: {
    title: "Student login",
    heading: "Welcome back. Pick up where you left off.",
    intro: "Log in to open your courses, quizzes and certificates.",
    emailPlaceholder: "you@school.edu",
    emailHint: "Use the email you subscribed with.",
    submitLabel: "Log in as a student",
    redirectTo: "/student",
    otherRole: {
      href: "/teacher/auth",
      text: "Are you a teacher?",
      cta: "Log in here",
    },
    footer: {
      text: "Don't have a plan yet?",
      cta: "Subscribe",
      href: "/subscribe",
    },
  },
  teacher: {
    title: "Teacher login",
    heading: "Your classes are waiting.",
    intro: "Log in to manage courses, write quizzes and follow your students.",
    emailPlaceholder: "you@school.edu",
    emailHint: "Use the email your school registered for you.",
    submitLabel: "Log in as a teacher",
    redirectTo: "/teacher",
    otherRole: {
      href: "/student/auth",
      text: "Are you a student?",
      cta: "Log in here",
    },
    footer: {
      text: "Need a teacher account?",
      cta: "Contact support",
      href: "/support",
    },
  },
} as const;

const FORGOT_PASSWORD_HREF = "/forgot-password";

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

type FieldName = "email" | "password";
type FormValues = Record<FieldName, string>;
type FormErrors = Partial<Record<FieldName, string>>;

const FIELD_ORDER: FieldName[] = ["email", "password"];

function validate(v: FormValues): FormErrors {
  const errors: FormErrors = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim()))
    errors.email = "Enter a valid email, like you@school.edu.";
  if (!v.password) errors.password = "Enter your password.";
  return errors;
}

/* -------------------------------------------------------------------------- */
/*  Icons                                                                      */
/* -------------------------------------------------------------------------- */

const ICONS = {
  cap: "M22 10v6M2 10l10-5 10 5-10 5z M6 12v5c3 3 9 3 12 0v-5",
  users:
    "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.9 M16 3.1a4 4 0 0 1 0 7.8",
  check: "M20 6 9 17l-5-5",
  alert: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M12 8v4 M12 16h.01",
  arrowLeft: "M19 12H5 M12 19l-7-7 7-7",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  eyeOff:
    "M17.9 17.9A10.9 10.9 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.1-5.9 M9.9 4.2A9.1 9.1 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.2 3.2 M1 1l22 22",
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
/*  Left panel preview cards (decorative)                                      */
/* -------------------------------------------------------------------------- */

function StudentPreview() {
  const rows = [
    { course: "Database Systems", percent: 72 },
    { course: "Network Fundamentals", percent: 45 },
  ];
  return (
    <div
      aria-hidden="true"
      className="w-full max-w-md rounded-3xl bg-white p-6 text-[#0F1B3D] shadow-2xl shadow-[#0B1F8A]/40"
    >
      <div className="flex items-center justify-between gap-3">
        <p className={`${DISPLAY} text-sm font-semibold text-[#2347F4]`}>
          Continue learning
        </p>
        <span className="rounded-full bg-[#FFD84A] px-3 py-1 text-xs font-semibold">
          2 in progress
        </span>
      </div>
      <div className="mt-5 space-y-5">
        {rows.map((r) => (
          <div key={r.course}>
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="truncate font-medium">{r.course}</span>
              <span className="text-slate-500">{r.percent}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#D5DBEE]">
              <div
                className="h-full rounded-full bg-[#2347F4]"
                style={{ width: `${r.percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-xl bg-[#F2F4FB] px-4 py-3 text-sm">
        <p className="text-slate-500">Next up</p>
        <p className="mt-0.5 font-medium">SQL joins: quiz (10 questions)</p>
      </div>
    </div>
  );
}

function TeacherPreview() {
  const rows = [
    { label: "Quizzes to review", value: "3" },
    { label: "Students who need a nudge", value: "2" },
    { label: "Lessons scheduled", value: "5" },
  ];
  return (
    <div
      aria-hidden="true"
      className="w-full max-w-md rounded-3xl bg-white p-6 text-[#0F1B3D] shadow-2xl shadow-black/30"
    >
      <div className="flex items-center justify-between gap-3">
        <p className={`${DISPLAY} text-sm font-semibold text-[#2347F4]`}>
          This week
        </p>
        <span className="rounded-full bg-[#FFD84A] px-3 py-1 text-xs font-semibold">
          IT 301
        </span>
      </div>
      <dl className="mt-4 divide-y divide-[#E3E7F4]">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex items-center justify-between gap-4 py-3.5 text-sm"
          >
            <dt className="text-slate-600">{r.label}</dt>
            <dd className={`${DISPLAY} text-2xl font-semibold`}>{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main component                                                             */
/* -------------------------------------------------------------------------- */

export default function LoginForm({ role }: { role: Role }) {
  const router = useRouter();
  const cfg = ROLES[role];
  const isTeacher = role === "teacher";

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const submitBtn = `inline-flex w-full items-center justify-center gap-2.5 rounded-xl px-5 py-3.5 text-center text-base font-semibold text-white transition-colors ${FOCUS} disabled:cursor-not-allowed motion-reduce:transition-none ${
    isTeacher
      ? "bg-[#0F1B3D] hover:bg-[#1A2A57] focus-visible:ring-[#0F1B3D]/30 disabled:bg-[#0F1B3D]/70"
      : "bg-[#2347F4] hover:bg-[#1B38C9] focus-visible:ring-[#2347F4]/30 disabled:bg-[#2347F4]/70"
  }`;

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function requestCode(): Promise<boolean> {
    setBusy(true);
    setSubmitError("");
    try {
      const result = await sendLoginCode({ email: email.trim() });
      if (!result.success) {
        setSubmitError(result.error);
        return false;
      }
      setCooldown(RESEND_SECONDS);
      return true;
    } catch {
      setSubmitError("Unable to send the code right now. Please try again.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (step === "email") {
      if (!EMAIL_RE.test(email.trim())) {
        setFieldError("Enter a valid email, like you@school.edu.");
        document.getElementById("email")?.focus();
        return;
      }
      setFieldError("");
      if (await requestCode()) {
        setCode("");
        setStep("code");
      }
      return;
    }

    if (code.length !== CODE_LENGTH) {
      setFieldError(`Enter the ${CODE_LENGTH}-digit code.`);
      document.getElementById("code")?.focus();
      return;
    }

    setFieldError("");
    setBusy(true);
    setSubmitError("");
    try {
      const result = await verifyLoginCode({ email: email.trim(), code, role });
      if (!result.success) {
        setSubmitError(result.error);
        setBusy(false);
        return;
      }
      router.push(result.redirectTo);
      router.refresh();
    } catch {
      setSubmitError("Unable to log in right now. Please try again.");
      setBusy(false);
    }
  }

  function changeEmail() {
    setStep("email");
    setCode("");
    setFieldError("");
    setSubmitError("");
  }

  const inputClass = (error?: string) =>
    `mt-1.5 block w-full rounded-xl border bg-white px-4 py-3 text-base text-[#0F1B3D] transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-4 motion-reduce:transition-none ${
      error
        ? "border-red-500 focus:border-red-500 focus:ring-red-100"
        : "border-[#7B87AB] hover:border-[#4A5883] focus:border-[#2347F4] focus:ring-[#2347F4]/20"
    }`;

  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      {/* ------------------------------ Left panel ------------------------------ */}
      <aside
        className={`relative px-6 py-7 text-white sm:px-10 lg:flex lg:flex-col lg:px-14 lg:py-12 ${
          isTeacher ? "bg-[#0F1B3D]" : "bg-[#2347F4]"
        }`}
        style={GRID_BG}
      >
        <Link
          href="/"
          className={`inline-flex w-fit items-center gap-2.5 rounded-lg ${FOCUS} focus-visible:ring-white/40`}
        >
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-xl bg-white ${
              isTeacher ? "text-[#0F1B3D]" : "text-[#2347F4]"
            }`}
          >
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
            {cfg.heading}
          </h1>
          <p
            className={`mt-3 text-base lg:text-lg ${
              isTeacher ? "text-slate-300" : "text-blue-100"
            }`}
          >
            {cfg.intro}
          </p>
        </div>

        <div className="mt-10 hidden lg:block">
          {isTeacher ? <TeacherPreview /> : <StudentPreview />}
        </div>
      </aside>

      {/* ------------------------------ Right panel ----------------------------- */}
      <section className="flex justify-center px-4 py-8 sm:px-8 lg:items-center lg:py-14">
        <div className="w-full max-w-lg">
          <Link
            href="/"
            className={`-ml-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-[#0F1B3D] ${FOCUS} focus-visible:ring-[#2347F4]/25`}
          >
            <Icon path={ICONS.arrowLeft} className="h-4 w-4" />
            Back to home
          </Link>

          <div className="mt-3 rounded-2xl border border-[#D5DBEE] bg-white p-6 shadow-sm sm:p-8">
            <span
              className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                isTeacher
                  ? "bg-[#FFD84A] text-[#0F1B3D]"
                  : "bg-[#2347F4] text-white"
              }`}
            >
              <Icon
                path={isTeacher ? ICONS.users : ICONS.cap}
                className="h-6 w-6"
              />
            </span>
            <h2
              className={`${DISPLAY} mt-5 text-2xl font-semibold tracking-tight`}
            >
              {cfg.title}
            </h2>
            <p className="mt-1.5 text-slate-600">
              {step === "email"
                ? "Enter your email and we'll send you a login code."
                : "Enter the code we sent to your email."}
            </p>
            <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-5">
              {step === "email" ? (
                <div>
                  <label htmlFor="email" className="block text-sm font-medium">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    inputMode="email"
                    autoComplete="username"
                    placeholder={cfg.emailPlaceholder}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldError) setFieldError("");
                      if (submitError) setSubmitError("");
                    }}
                    aria-invalid={fieldError ? true : undefined}
                    aria-describedby="email-message"
                    className={inputClass(fieldError)}
                  />
                  {fieldError ? (
                    <p
                      id="email-message"
                      className="mt-1.5 flex items-start gap-1.5 text-sm text-red-700"
                    >
                      <Icon
                        path={ICONS.alert}
                        className="mt-0.5 h-4 w-4 shrink-0"
                      />
                      {fieldError}
                    </p>
                  ) : (
                    <p
                      id="email-message"
                      className="mt-1.5 text-sm text-slate-500"
                    >
                      {cfg.emailHint} We&apos;ll email you a login code.
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <label htmlFor="code" className="block text-sm font-medium">
                    Login code
                  </label>
                  <input
                    id="code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={CODE_LENGTH}
                    placeholder={"0".repeat(CODE_LENGTH)}
                    value={code}
                    autoFocus
                    onChange={(e) => {
                      setCode(
                        e.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH),
                      );
                      if (fieldError) setFieldError("");
                      if (submitError) setSubmitError("");
                    }}
                    aria-invalid={fieldError ? true : undefined}
                    aria-describedby="code-message"
                    className={`${inputClass(fieldError)} text-center text-2xl tracking-[0.5em]`}
                  />
                  {fieldError ? (
                    <p
                      id="code-message"
                      className="mt-1.5 flex items-start gap-1.5 text-sm text-red-700"
                    >
                      <Icon
                        path={ICONS.alert}
                        className="mt-0.5 h-4 w-4 shrink-0"
                      />
                      {fieldError}
                    </p>
                  ) : (
                    <p
                      id="code-message"
                      className="mt-1.5 text-sm text-slate-500"
                    >
                      We sent a code to{" "}
                      <span className="font-medium">{email.trim()}</span>.
                    </p>
                  )}
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <button
                      type="button"
                      onClick={changeEmail}
                      className={`rounded font-medium text-[#2347F4] underline-offset-4 hover:underline ${FOCUS} focus-visible:ring-[#2347F4]/25`}
                    >
                      Use a different email
                    </button>
                    <button
                      type="button"
                      disabled={cooldown > 0 || busy}
                      onClick={requestCode}
                      className={`rounded font-medium text-[#2347F4] underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline ${FOCUS} focus-visible:ring-[#2347F4]/25`}
                    >
                      {cooldown > 0
                        ? `Resend code in ${cooldown}s`
                        : "Resend code"}
                    </button>
                  </div>
                </div>
              )}

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

              <button type="submit" disabled={busy} className={submitBtn}>
                {busy ? (
                  <>
                    <Spinner />
                    {step === "email" ? "Sending code…" : "Logging in…"}
                  </>
                ) : step === "email" ? (
                  "Send me a code"
                ) : (
                  cfg.submitLabel
                )}
              </button>
            </form>
          </div>

          <div className="mt-5 space-y-2 text-center text-sm text-slate-600">
            <p>
              {cfg.otherRole.text}{" "}
              <Link
                href={cfg.otherRole.href}
                className={`rounded font-medium text-[#2347F4] underline-offset-4 hover:underline ${FOCUS} focus-visible:ring-[#2347F4]/25`}
              >
                {cfg.otherRole.cta}
              </Link>
            </p>
            <p>
              {cfg.footer.text}{" "}
              <Link
                href={cfg.footer.href}
                className={`rounded font-medium text-[#2347F4] underline-offset-4 hover:underline ${FOCUS} focus-visible:ring-[#2347F4]/25`}
              >
                {cfg.footer.cta}
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
