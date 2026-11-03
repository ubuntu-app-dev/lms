"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import TopNav from "@/components/layout/TopNav";
import TopicLessons from "@/components/topic/TopicLessons";
import LockedTopic from "@/components/topic/LockedTopic";
import ProgressBar from "@/components/topic/ProgressBar";
import { Icon, ICONS } from "@/components/icon/Icon";
import { useProgress } from "@/components/progress/ProgressProvider";
import {
  BASE_PATH,
  CONTINUE_TOPIC,
  DISPLAY,
  DUE,
  FOCUS,
  GRID_BG,
  LESSONS_BY_TOPIC,
  TOPICS,
  TOPIC_BY_SLUG,
  USER,
  WEEK,
  parseTopic,
  type Topic,
} from "@/data/data";
import type { DashboardUser } from "@/types/auth";

type DashboardProps = {
  user: DashboardUser;
};

function TopicCard({ topic }: { topic: Topic }) {
  const { completedCount } = useProgress();
  const total = LESSONS_BY_TOPIC[topic.slug]?.length ?? 0;
  const done = completedCount(topic.slug);
  const percent = total ? Math.round((done / total) * 100) : 0;

  return (
    <Link
      href={`${BASE_PATH}?topic=${topic.slug}`}
      className={`flex h-full flex-col rounded-2xl border p-5 transition-colors motion-reduce:transition-none ${FOCUS} ${
        topic.locked
          ? "border-dashed border-[#B8C1DE] bg-white/70 hover:border-[#4A5883]"
          : "border-[#D5DBEE] bg-white hover:border-[#2347F4]"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${
            topic.locked ? "bg-[#E3E7F4] text-slate-500" : topic.tile
          }`}
        >
          <Icon path={topic.icon} />
        </span>
        {topic.locked && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E3E7F4] px-2.5 py-1 text-xs font-semibold text-slate-600">
            <Icon path={ICONS.lock} className="h-3.5 w-3.5" />
            Locked
          </span>
        )}
      </div>

      <h3 className={`${DISPLAY} mt-4 text-lg font-semibold`}>{topic.label}</h3>
      <p className="mt-1 text-sm text-slate-600">{topic.description}</p>

      <div className="mt-auto pt-5">
        {topic.locked ? (
          <p className="text-sm font-medium text-slate-600">Not open yet</p>
        ) : (
          <>
            <ProgressBar value={percent} label={`${topic.label} progress`} />
            <p className="mt-2 text-sm font-medium">
              {done} of {total} topics complete
            </p>
          </>
        )}
      </div>
    </Link>
  );
}

function Overview({ user }: { user: DashboardUser }) {
  const { completedCount, nextLesson } = useProgress();
  const firstName = user.fullName.split(" ")[0];

  const continueTopic = TOPIC_BY_SLUG[CONTINUE_TOPIC];
  const next = nextLesson(CONTINUE_TOPIC);
  const total = LESSONS_BY_TOPIC[CONTINUE_TOPIC]?.length ?? 0;
  const done = completedCount(CONTINUE_TOPIC);
  const percent = total ? Math.round((done / total) * 100) : 0;
  const allDone = total > 0 && done === total;

  const openCount = TOPICS.filter((t) => !t.locked).length;
  const lockedCount = TOPICS.length - openCount;

  const weekTotal = WEEK.reduce((sum, d) => sum + d.minutes, 0);
  const weekMax = Math.max(...WEEK.map((d) => d.minutes), 1);
  const weekSummary = `Study time this week: ${WEEK.map(
    (d) => `${d.day} ${d.minutes} minutes`,
  ).join(", ")}`;
  const weekLabel =
    weekTotal >= 60
      ? `${Math.floor(weekTotal / 60)}h ${weekTotal % 60}m`
      : `${weekTotal}m`;

  return (
    <>
      <h1
        className={`${DISPLAY} text-3xl font-semibold tracking-tight sm:text-4xl`}
      >
        Welcome back, {firstName}
      </h1>
      <p className="mt-1.5 text-slate-600">
        {done} of {total} {continueTopic.label} topics complete.
      </p>

      {USER.subscription === "pending" && (
        <div
          role="status"
          className="mt-5 flex items-start gap-3 rounded-2xl bg-[#FFF3C4] px-4 py-3 text-sm text-[#5C4300]"
        >
          <Icon path={ICONS.clock} className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            We&apos;re checking your payment. Your Premium access unlocks as
            soon as it&apos;s confirmed.
          </p>
        </div>
      )}

      {/* Continue learning + this week */}
      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {next && (
          <section
            aria-labelledby="continue-heading"
            className="relative flex flex-col rounded-3xl bg-[#2347F4] p-6 text-white sm:p-8 lg:col-span-2"
            style={GRID_BG}
          >
            <h2
              id="continue-heading"
              className="text-sm font-medium text-blue-100"
            >
              Continue learning
            </h2>
            <p
              className={`${DISPLAY} mt-3 text-2xl font-semibold leading-tight sm:text-3xl`}
            >
              Lesson {next.number}: {next.title}
            </p>
            <p className="mt-1.5 text-blue-100">
              {continueTopic.label}, {next.module}
            </p>

            <div className="mt-6 max-w-md">
              <ProgressBar
                value={percent}
                label={`${continueTopic.label} progress`}
                track="bg-white/25"
                fill="bg-[#FFD84A]"
              />
              <p className="mt-2 text-sm text-blue-100">
                {done} of {total} topics complete
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Link
                href={`/topics/${CONTINUE_TOPIC}/${next.slug}`}
                className="inline-flex items-center gap-2 rounded-xl bg-[#FFD84A] px-5 py-3 font-semibold text-[#0F1B3D] transition-colors hover:bg-[#FFCE1F] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50 motion-reduce:transition-none"
              >
                <Icon path={ICONS.play} className="h-4 w-4" />
                Start lesson
              </Link>
              <span className="text-sm text-blue-100">
                About {next.minutes} minutes
              </span>
            </div>
          </section>
        )}

        {/* Every lesson finished: nothing left to continue */}
        {!next && allDone && (
          <section
            aria-labelledby="continue-heading"
            className="relative flex flex-col rounded-3xl bg-[#2347F4] p-6 text-white sm:p-8 lg:col-span-2"
            style={GRID_BG}
          >
            <h2
              id="continue-heading"
              className="text-sm font-medium text-blue-100"
            >
              Continue learning
            </h2>
            <p
              className={`${DISPLAY} mt-3 text-2xl font-semibold leading-tight sm:text-3xl`}
            >
              You&apos;ve finished {continueTopic.label}
            </p>
            <p className="mt-1.5 text-blue-100">
              All {total} topics are complete.
            </p>
            <div className="mt-6 max-w-md">
              <ProgressBar
                value={100}
                label={`${continueTopic.label} progress`}
                track="bg-white/25"
                fill="bg-[#FFD84A]"
              />
            </div>
            <div className="mt-6">
              <Link
                href={`${BASE_PATH}?topic=${CONTINUE_TOPIC}`}
                className="inline-flex items-center gap-2 rounded-xl bg-[#FFD84A] px-5 py-3 font-semibold text-[#0F1B3D] transition-colors hover:bg-[#FFCE1F] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50 motion-reduce:transition-none"
              >
                Review the lessons
              </Link>
            </div>
          </section>
        )}

        <section
          aria-labelledby="week-heading"
          className="rounded-3xl border border-[#D5DBEE] bg-white p-6"
        >
          <div className="flex items-baseline justify-between gap-3">
            <h2
              id="week-heading"
              className={`${DISPLAY} text-lg font-semibold`}
            >
              This week
            </h2>
            <p className="text-sm text-slate-600">{weekLabel} studied</p>
          </div>

          <div role="img" aria-label={weekSummary} className="mt-5 flex gap-2">
            {WEEK.map((d) => (
              <div
                key={d.day}
                className="flex flex-1 flex-col items-center gap-2"
              >
                <div className="flex h-16 w-full items-end">
                  <div
                    className={`w-full rounded-md ${
                      d.today ? "bg-[#2347F4]" : "bg-[#C9D3F7]"
                    }`}
                    style={{
                      height: `${Math.max((d.minutes / weekMax) * 100, 6)}%`,
                    }}
                  />
                </div>
                <span
                  className={`text-xs ${
                    d.today ? "font-semibold text-[#0F1B3D]" : "text-slate-500"
                  }`}
                >
                  {d.day}
                </span>
              </div>
            ))}
          </div>

          <h3 className="mt-6 border-t border-[#E3E7F4] pt-5 text-sm font-semibold">
            Due soon
          </h3>
          <ul className="mt-3 space-y-3">
            {DUE.map((item) => (
              <li
                key={item.title}
                className="flex items-start justify-between gap-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{item.title}</p>
                  <p className="truncate text-slate-500">{item.course}</p>
                </div>
                <span className="shrink-0 rounded-full bg-[#FFF3C4] px-2.5 py-1 text-xs font-semibold text-[#5C4300]">
                  {item.due}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* All topics */}
      <section aria-labelledby="topics-heading" className="mt-12">
        <h2
          id="topics-heading"
          className={`${DISPLAY} text-2xl font-semibold tracking-tight`}
        >
          Topics
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          {openCount} open, {lockedCount} locked
        </p>

        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOPICS.map((topic) => (
            <li key={topic.slug}>
              <TopicCard topic={topic} />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function Dashboard({ user }: DashboardProps) {
  const searchParams = useSearchParams();
  const active = parseTopic(searchParams.get("topic"));
  const topic = active === "all" ? null : TOPIC_BY_SLUG[active];
  const navUser = {
    ...user,
    unreadNotifications: 0,
  };
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:shadow-lg"
      >
        Skip to content
      </a>

      <TopNav active={active} user={navUser} navUser={navUser} />

      <main
        id="main"
        className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10"
      >
        {!topic ? (
          <Overview user={user} />
        ) : topic.locked ? (
          <LockedTopic topic={topic} />
        ) : (
          <TopicLessons topic={topic} />
        )}
      </main>
    </>
  );
}
