"use client";

import Link from "next/link";
import type { CSSProperties } from "react";

/* -------------------------------------------------------------------------- */
/*  Config: edit these                                                         */
/* -------------------------------------------------------------------------- */

const BRAND = "LMS";

const ROUTES = {
  studentLogin: "/student/auth",
  teacherLogin: "/teacher/auth",
  redeem: "/redeem",
  subscribe: "/subscribe",
  support: "/support",
};

const PLAN = { name: "Premium", price: 499, currency: "PHP" };

const TRACKS = [
  {
    icon: "code",
    title: "Programming",
    text: "Python, Java, C# and the problem-solving habits behind them.",
  },
  {
    icon: "globe",
    title: "Web development",
    text: "HTML, CSS, JavaScript and modern frameworks, built project by project.",
  },
  {
    icon: "database",
    title: "Databases",
    text: "Design schemas, write SQL, and learn how data is stored and queried.",
  },
  {
    icon: "server",
    title: "Networking",
    text: "Protocols, addressing, routing and the hardware that connects it all.",
  },
  {
    icon: "shield",
    title: "Cybersecurity",
    text: "Threats, defenses and safe practices for systems you'll maintain.",
  },
  {
    icon: "cloud",
    title: "Cloud and DevOps",
    text: "Deploy, monitor and scale applications on real infrastructure.",
  },
] as const;

const FEATURES = [
  {
    icon: "book",
    title: "Lessons that fit your schedule",
    text: "Short lessons with code samples. Download them for offline study when your connection is slow.",
  },
  {
    icon: "check",
    title: "Quizzes that check your understanding",
    text: "Practice after every lesson and see exactly which topics need another look.",
  },
  {
    icon: "chart",
    title: "Progress you can see",
    text: "Track completed lessons, quiz scores and the courses you've started in one place.",
  },
  {
    icon: "award",
    title: "Certificates for finished courses",
    text: "Complete a course and get a certificate you can add to your portfolio.",
  },
] as const;

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const DISPLAY = "font-[family-name:var(--font-display)]";

const GRID_BG: CSSProperties = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px)",
  backgroundSize: "32px 32px",
};

const PRICE_LABEL = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: PLAN.currency,
  maximumFractionDigits: 0,
}).format(PLAN.price);

const FOCUS = "focus-visible:outline-none focus-visible:ring-4";

const BTN_BASE = `inline-flex items-center justify-center gap-2.5 rounded-xl px-6 py-3.5 text-base font-semibold transition-colors motion-reduce:transition-none ${FOCUS}`;

const BTN_YELLOW = `${BTN_BASE} bg-[#FFD84A] text-[#0F1B3D] hover:bg-[#FFE27A] focus-visible:ring-white/40`;
const BTN_OUTLINE_LIGHT = `${BTN_BASE} border border-white/60 text-white hover:bg-white/10 focus-visible:ring-white/40`;
const BTN_BLUE = `${BTN_BASE} bg-[#2347F4] text-white hover:bg-[#1B38C9] focus-visible:ring-[#2347F4]/30`;
const BTN_NAVY = `${BTN_BASE} bg-[#0F1B3D] text-white hover:bg-[#1A2A57] focus-visible:ring-[#0F1B3D]/30`;

/* -------------------------------------------------------------------------- */
/*  Icons                                                                      */
/* -------------------------------------------------------------------------- */

const ICONS: Record<string, string> = {
  cap: "M22 10v6M2 10l10-5 10 5-10 5z M6 12v5c3 3 9 3 12 0v-5",
  check: "M20 6 9 17l-5-5",
  code: "M16 18l6-6-6-6 M8 6l-6 6 6 6",
  globe:
    "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M2 12h20 M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z",
  database:
    "M12 2c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3z M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5 M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3",
  server: "M3 4h18v6H3z M3 14h18v6H3z M7 7h.01 M7 17h.01",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  cloud: "M18 10h-1.3A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z",
  book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5",
  chart: "M3 3v18h18 M7 14l4-4 4 4 5-5",
  award: "M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12z M8.2 13.9 7 23l5-3 5 3-1.2-9.1",
  users:
    "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.9 M16 3.1a4 4 0 0 1 0 7.8",
  edit: "M12 20h9 M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z",
};

function Icon({
  name,
  className = "h-5 w-5",
}: {
  name: keyof typeof ICONS;
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
      <path d={ICONS[name]} />
    </svg>
  );
}

function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2.5 rounded-lg ${FOCUS} ${
        dark ? "focus-visible:ring-[#2347F4]/30" : "focus-visible:ring-white/40"
      }`}
    >
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-xl ${
          dark ? "bg-[#2347F4] text-white" : "bg-white text-[#2347F4]"
        }`}
      >
        <Icon name="cap" />
      </span>
      <span className={`${DISPLAY} text-xl font-semibold tracking-tight`}>
        {BRAND}
      </span>
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/*  Hero terminal: the memorable element                                       */
/* -------------------------------------------------------------------------- */

function ProgressLine({
  course,
  percent,
}: {
  course: string;
  percent: number;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1.5">
      <span className="truncate text-slate-200">{course}</span>
      <span className="text-[#FFD84A]">{percent}%</span>
      <div className="col-span-2 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-[#FFD84A]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function Terminal() {
  return (
    // Decorative illustration of a learner's session.
    <div
      aria-hidden="true"
      className="w-full max-w-lg overflow-hidden rounded-2xl bg-[#0F1B3D] text-white shadow-2xl shadow-[#0B1F8A]/50"
    >
      <div className="flex items-center gap-2 border-b border-white/10 px-5 py-3.5">
        <span className="h-3 w-3 rounded-full bg-white/20" />
        <span className="h-3 w-3 rounded-full bg-white/20" />
        <span className="h-3 w-3 rounded-full bg-white/20" />
        <span className="ml-3 text-xs text-slate-400">my-learning</span>
      </div>

      <div className="space-y-5 px-5 py-6 font-mono text-sm leading-relaxed">
        <div>
          <p>
            <span className="text-[#FFD84A]">$</span> lms resume
          </p>
          <p className="mt-1 text-slate-400">
            Welcome back. Picking up where you left off.
          </p>
        </div>

        <div className="space-y-4">
          <ProgressLine course="Database Systems" percent={72} />
          <ProgressLine course="Network Fundamentals" percent={45} />
          <ProgressLine course="Intro to Python" percent={100} />
        </div>

        <div className="rounded-xl bg-white/5 px-4 py-3">
          <p className="text-slate-400">Next up</p>
          <p className="mt-0.5 text-white">SQL joins: quiz (10 questions)</p>
        </div>

        <p className="text-slate-400">
          <span className="text-[#FFD84A]">$</span>
          <span className="ml-2 inline-block h-4 w-2 translate-y-0.5 bg-slate-300 motion-safe:animate-pulse" />
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function Landing() {
  return (
    <>
      {/* ------------------------------- Hero -------------------------------- */}
      <div className="bg-[#2347F4] text-white" style={GRID_BG}>
        <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <Logo />
          <nav
            aria-label="Main"
            className="flex items-center gap-1 text-sm font-medium sm:gap-2"
          >
            <a
              href="#tracks"
              className={`hidden rounded-lg px-3 py-2 text-blue-100 hover:text-white sm:block ${FOCUS} focus-visible:ring-white/40`}
            >
              Tracks
            </a>
            <a
              href="#portals"
              className={`hidden rounded-lg px-3 py-2 text-blue-100 hover:text-white sm:block ${FOCUS} focus-visible:ring-white/40`}
            >
              Portals
            </a>
            <a
              href={ROUTES.redeem}
              className={`hidden rounded-lg px-3 py-2 text-blue-100 hover:text-white sm:block ${FOCUS} focus-visible:ring-white/40`}
            >
              Redeem Code
            </a>
            <Link
              href={ROUTES.teacherLogin}
              className={`rounded-lg px-3 py-2 hover:bg-white/10 ${FOCUS} focus-visible:ring-white/40`}
            >
              Teacher login
            </Link>
            <Link
              href={ROUTES.studentLogin}
              className={`rounded-lg bg-white px-4 py-2 text-[#2347F4] hover:bg-blue-50 ${FOCUS} focus-visible:ring-white/40`}
            >
              Student login
            </Link>
          </nav>
        </header>

        <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-10 sm:px-8 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-10 lg:pb-24 lg:pt-16">
          <div>
            <h1
              className={`${DISPLAY} max-w-xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl`}
            >
              The learning platform built for IT students
            </h1>
            <p className="mt-5 max-w-lg text-lg text-blue-100">
              Courses, quizzes and certificates for programming, networking,
              databases and security. Students learn at their own pace. Teachers
              see how everyone is doing.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={ROUTES.studentLogin} className={BTN_YELLOW}>
                <Icon name="cap" />
                Log in as a student
              </Link>
              <Link href={ROUTES.teacherLogin} className={BTN_OUTLINE_LIGHT}>
                <Icon name="users" />
                Log in as a teacher
              </Link>
            </div>

            <p className="mt-5 text-sm text-blue-100">
              New here?{" "}
              <Link
                href={ROUTES.subscribe}
                className={`rounded font-semibold text-white underline underline-offset-4 ${FOCUS} focus-visible:ring-white/40`}
              >
                Subscribe for {PRICE_LABEL} a month
              </Link>
            </p>
          </div>

          <div className="flex justify-center lg:justify-end">
            <Terminal />
          </div>
        </section>
      </div>

      <main className="bg-[#F2F4FB]">
        {/* ------------------------------ Tracks ------------------------------ */}
        <section
          id="tracks"
          className="mx-auto max-w-6xl scroll-mt-4 px-5 py-16 sm:px-8 lg:py-24"
        >
          <div className="max-w-2xl">
            <h2
              className={`${DISPLAY} text-3xl font-semibold tracking-tight sm:text-4xl`}
            >
              Everything an IT program covers
            </h2>
            <p className="mt-3 text-lg text-slate-600">
              Six tracks that follow what you study in class, so the course you
              open tonight matches the lecture you had today.
            </p>
          </div>

          <ul className="mt-10 grid gap-x-12 md:grid-cols-2">
            {TRACKS.map((t) => (
              <li
                key={t.title}
                className="flex gap-4 border-t border-[#D5DBEE] py-6"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#2347F4]/10 text-[#2347F4]">
                  <Icon name={t.icon} />
                </span>
                <div>
                  <h3 className={`${DISPLAY} text-lg font-semibold`}>
                    {t.title}
                  </h3>
                  <p className="mt-1 text-slate-600">{t.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* ------------------------------ Portals ----------------------------- */}
        <section
          id="portals"
          className="mx-auto max-w-6xl scroll-mt-4 px-5 pb-16 sm:px-8 lg:pb-24"
        >
          <div className="max-w-2xl">
            <h2
              className={`${DISPLAY} text-3xl font-semibold tracking-tight sm:text-4xl`}
            >
              Choose how you log in
            </h2>
            <p className="mt-3 text-lg text-slate-600">
              Students and teachers have their own space, with tools made for
              what each one does.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {/* Student */}
            <article className="flex flex-col rounded-3xl bg-white p-7 shadow-sm ring-1 ring-[#D5DBEE] sm:p-9">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2347F4] text-white">
                <Icon name="cap" className="h-6 w-6" />
              </span>
              <h3
                className={`${DISPLAY} mt-6 text-2xl font-semibold tracking-tight`}
              >
                Student portal
              </h3>
              <p className="mt-2 text-slate-600">
                Open your courses, take quizzes and keep track of how far you
                have come.
              </p>
              <ul className="mt-6 space-y-3 text-[#0F1B3D]">
                {[
                  "Access every course on your plan",
                  "Take quizzes and see your scores",
                  "Download lessons for offline study",
                  "Collect certificates as you finish",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FFD84A] text-[#0F1B3D]">
                      <Icon name="check" className="h-3 w-3" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-col gap-3 pt-2 sm:flex-row sm:items-center lg:mt-auto lg:pt-8">
                <Link href={ROUTES.studentLogin} className={BTN_BLUE}>
                  Log in as a student
                </Link>
                <Link
                  href={ROUTES.subscribe}
                  className={`rounded-lg px-3 py-2 text-center text-sm font-semibold text-[#2347F4] hover:bg-[#2347F4]/10 ${FOCUS} focus-visible:ring-[#2347F4]/25`}
                >
                  Don&apos;t have a plan yet? Subscribe
                </Link>
              </div>
            </article>

            {/* Teacher */}
            <article className="flex flex-col rounded-3xl bg-[#0F1B3D] p-7 text-white sm:p-9">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFD84A] text-[#0F1B3D]">
                <Icon name="users" className="h-6 w-6" />
              </span>
              <h3
                className={`${DISPLAY} mt-6 text-2xl font-semibold tracking-tight`}
              >
                Teacher portal
              </h3>
              <p className="mt-2 text-slate-300">
                Build courses, write quizzes and see which students need a hand.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Create and organize lessons",
                  "Write quizzes and review results",
                  "Follow each student's progress",
                  "Manage your classes in one place",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2347F4] text-white">
                      <Icon name="check" className="h-3 w-3" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8 pt-2 lg:mt-auto lg:pt-8">
                <Link
                  href={ROUTES.teacherLogin}
                  className={`${BTN_BASE} bg-white text-[#0F1B3D] hover:bg-blue-50 focus-visible:ring-white/40`}
                >
                  Log in as a teacher
                </Link>
              </div>
            </article>
          </div>
        </section>

        {/* ----------------------------- Features ----------------------------- */}
        <section className="border-t border-[#D5DBEE] bg-white">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
            <div className="max-w-2xl">
              <h2
                className={`${DISPLAY} text-3xl font-semibold tracking-tight sm:text-4xl`}
              >
                Study tools that keep you moving
              </h2>
            </div>

            <dl className="mt-10 grid gap-x-12 gap-y-10 sm:grid-cols-2">
              {FEATURES.map((f) => (
                <div key={f.title} className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFD84A] text-[#0F1B3D]">
                    <Icon name={f.icon} />
                  </span>
                  <div>
                    <dt className={`${DISPLAY} text-lg font-semibold`}>
                      {f.title}
                    </dt>
                    <dd className="mt-1 text-slate-600">{f.text}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ------------------------------- CTA -------------------------------- */}
        <section className="bg-[#2347F4] text-white" style={GRID_BG}>
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-5 py-14 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:py-16">
            <div className="max-w-xl">
              <h2
                className={`${DISPLAY} text-3xl font-semibold tracking-tight sm:text-4xl`}
              >
                Get full access for {PRICE_LABEL} a month
              </h2>
              <p className="mt-3 text-lg text-blue-100">
                Subscribe to the {PLAN.name} plan and unlock every course. Pay
                by scanning a QR code with your banking or e-wallet app.
              </p>
            </div>
            <Link
              href={ROUTES.subscribe}
              className={`${BTN_YELLOW} w-full shrink-0 sm:w-auto`}
            >
              Subscribe now
            </Link>
          </div>
        </section>
      </main>

      {/* ------------------------------ Footer -------------------------------- */}
      <footer className="bg-white text-[#0F1B3D]">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between">
          <Logo dark />
          <nav
            aria-label="Footer"
            className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-slate-600"
          >
            <Link
              href={ROUTES.studentLogin}
              className="rounded hover:text-[#2347F4]"
            >
              Student login
            </Link>
            <Link
              href={ROUTES.teacherLogin}
              className="rounded hover:text-[#2347F4]"
            >
              Teacher login
            </Link>
            <Link
              href={ROUTES.subscribe}
              className="rounded hover:text-[#2347F4]"
            >
              Subscribe
            </Link>
            <Link
              href={ROUTES.support}
              className="rounded hover:text-[#2347F4]"
            >
              Support
            </Link>
          </nav>
          <p className="text-sm text-slate-500">
            &copy; {2026} {BRAND}. Made for IT students.
          </p>
        </div>
      </footer>
    </>
  );
}
