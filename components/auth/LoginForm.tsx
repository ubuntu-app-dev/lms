"use client";

import {
  useState,
  type ChangeEvent,
  type CSSProperties,
  type FocusEvent,
  type FormEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/* -------------------------------------------------------------------------- */
/*  Config: edit these                                                         */
/* -------------------------------------------------------------------------- */

const BRAND = "LMS";

type Role = "student" | "teacher";

const ROLES = {
  student: {
    title: "Student login",
    heading: "Welcome back. Pick up where you left off.",
    intro: "Log in to open your courses, quizzes and certificates.",
    emailPlaceholder: "you@school.edu",
    emailHint: "Use the email you subscribed with.",
    submitLabel: "Log in as a student",
    redirectTo: "/dashboard",
    otherRole: {
      href: "/login/teacher",
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
    redirectTo: "/teacher/dashboard",
    otherRole: {
      href: "/login/student",
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

/**
 * Replace the body with a real API call (or your auth library's sign-in
 * function). Throw an error when the email or password is wrong.
 */
async function logIn(
  role: Role,
  values: FormValues & { remember: boolean },
): Promise<void> {
  // const res = await fetch("/api/auth/login", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ role, ...values }),
  // });
  // if (res.status === 401) throw new Error("invalid");
  // if (!res.ok) throw new Error("failed");
  void role;
  void values;
  await new Promise((r) => setTimeout(r, 900));
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

  const [values, setValues] = useState<FormValues>({ email: "", password: "" });
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>(
    {},
  );
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const submitBtn = `inline-flex w-full items-center justify-center gap-2.5 rounded-xl px-5 py-3.5 text-center text-base font-semibold text-white transition-colors ${FOCUS} disabled:cursor-not-allowed motion-reduce:transition-none ${
    isTeacher
      ? "bg-[#0F1B3D] hover:bg-[#1A2A57] focus-visible:ring-[#0F1B3D]/30 disabled:bg-[#0F1B3D]/70"
      : "bg-[#2347F4] hover:bg-[#1B38C9] focus-visible:ring-[#2347F4]/30 disabled:bg-[#2347F4]/70"
  }`;

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const name = e.target.name as FieldName;
    const next = { ...values, [name]: e.target.value };
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
    setTouched({ email: true, password: true });

    const firstInvalid = FIELD_ORDER.find((n) => found[n]);
    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus();
      return;
    }

    setBusy(true);
    setSubmitError("");
    try {
      await logIn(role, { ...values, remember });
      router.push(cfg.redirectTo);
    } catch {
      setSubmitError(
        "That email and password don't match. Check them and try again.",
      );
      setBusy(false);
    }
  }

  const inputClass = (error?: string) =>
    `mt-1.5 block w-full rounded-xl border bg-white px-4 py-3 text-base text-[#0F1B3D] transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-4 motion-reduce:transition-none ${
      error
        ? "border-red-500 focus:border-red-500 focus:ring-red-100"
        : "border-[#7B87AB] hover:border-[#4A5883] focus:border-[#2347F4] focus:ring-[#2347F4]/20"
    }`;

  const fieldError = (id: FieldName, message?: string) =>
    message ? (
      <p
        id={`${id}-message`}
        className="mt-1.5 flex items-start gap-1.5 text-sm text-red-700"
      >
        <Icon path={ICONS.alert} className="mt-0.5 h-4 w-4 shrink-0" />
        {message}
      </p>
    ) : null;

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
              Enter your email and password to continue.
            </p>

            <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-5">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="username"
                  placeholder={cfg.emailPlaceholder}
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  aria-invalid={errors.email ? true : undefined}
                  aria-describedby={`email-message`}
                  className={inputClass(errors.email)}
                />
                {fieldError("email", errors.email) ?? (
                  <p
                    id="email-message"
                    className="mt-1.5 text-sm text-slate-500"
                  >
                    {cfg.emailHint}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between gap-4">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium"
                  >
                    Password
                  </label>
                  <Link
                    href={FORGOT_PASSWORD_HREF}
                    className={`rounded text-sm font-medium text-[#2347F4] underline-offset-4 hover:underline ${FOCUS} focus-visible:ring-[#2347F4]/25`}
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Your password"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    aria-invalid={errors.password ? true : undefined}
                    aria-describedby={
                      errors.password ? "password-message" : undefined
                    }
                    className={`${inputClass(errors.password)} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                    className={`absolute right-1.5 top-[0.4375rem] flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-[#0F1B3D] ${FOCUS} focus-visible:ring-[#2347F4]/25`}
                  >
                    <Icon path={showPassword ? ICONS.eyeOff : ICONS.eye} />
                  </button>
                </div>
                {fieldError("password", errors.password)}
              </div>

              {/* Remember me */}
              <label className="flex cursor-pointer items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-5 w-5 rounded border-[#7B87AB] accent-[#2347F4]"
                />
                Keep me logged in on this device
              </label>

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
                    Logging in…
                  </>
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
