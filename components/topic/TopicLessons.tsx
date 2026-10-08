import Link from "next/link";
import { Icon, ICONS } from "@/components/icon/Icon";
import ProgressBar from "./ProgressBar";
import {
  BTN_PRIMARY,
  DISPLAY,
  FOCUS,
  LESSONS_BY_TOPIC,
  completedCount,
  lessonStatus,
  nextLesson,
  type Lesson,
  type LessonStatus,
  type Topic,
} from "@/data/data";

function groupByModule(lessons: Lesson[]) {
  const groups: { title: string; lessons: Lesson[] }[] = [];
  for (const lesson of lessons) {
    const last = groups[groups.length - 1];
    if (last && last.title === lesson.module) last.lessons.push(lesson);
    else groups.push({ title: lesson.module, lessons: [lesson] });
  }
  return groups;
}

function LessonRow({
  lesson,
  status,
  href,
}: {
  lesson: Lesson;
  status: LessonStatus;
  href: string;
}) {
  const badge =
    status === "completed"
      ? "bg-[#2347F4] text-white"
      : status === "current"
        ? "bg-[#FFD84A] text-[#0F1B3D]"
        : "bg-[#EEF1FA] text-slate-600";

  return (
    <Link
      href={href}
      className={`flex items-start gap-4 rounded-2xl border bg-white p-4 transition-colors hover:border-[#2347F4] motion-reduce:transition-none ${FOCUS} ${
        status === "current" ? "border-[#2347F4]" : "border-[#D5DBEE]"
      }`}
    >
      <span
        aria-hidden="true"
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${badge}`}
      >
        {status === "completed" ? (
          <Icon path={ICONS.check} className="h-5 w-5" />
        ) : (
          lesson.number
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block font-semibold">
          <span className="sr-only">Lesson {lesson.number}: </span>
          {lesson.title}
        </span>
        <span className="mt-0.5 block text-sm text-slate-600">
          {lesson.summary}
        </span>
        <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <Icon path={ICONS.clock} className="h-4 w-4" />
            {lesson.minutes} min
          </span>
          {status === "completed" && (
            <span className="rounded-full bg-[#DDF3E8] px-2.5 py-0.5 text-xs font-semibold text-[#0B6B42]">
              Completed
            </span>
          )}
          {status === "current" && (
            <span className="rounded-full bg-[#FFF3C4] px-2.5 py-0.5 text-xs font-semibold text-[#5C4300]">
              Up next
            </span>
          )}
        </span>
      </span>
    </Link>
  );
}

export default function TopicLessons({ topic }: { topic: Topic }) {
  const lessons = LESSONS_BY_TOPIC[topic.slug] ?? [];
  const total = lessons.length;
  const done = completedCount(topic.slug);
  const percent = total ? Math.round((done / total) * 100) : 0;
  const next = nextLesson(topic.slug);
  const modules = groupByModule(lessons);

  const lessonHref = (l: Lesson) => `/topics/${topic.slug}/${l.slug}`;
  const moduleDone = (m: { lessons: Lesson[] }) =>
    m.lessons.filter((l) => lessonStatus(topic.slug, l.number) === "completed")
      .length;

  return (
    <>
      <header className="flex items-start gap-4">
        <span
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${topic.tile}`}
        >
          <Icon path={topic.icon} className="h-7 w-7" />
        </span>
        <div>
          <h1
            className={`${DISPLAY} text-3xl font-semibold tracking-tight sm:text-4xl`}
          >
            {topic.label}
          </h1>
          <p className="mt-1.5 max-w-2xl text-slate-600">
            {topic.description}
            {total > 0 && ` ${total} topics in ${modules.length} modules.`}
          </p>
        </div>
      </header>

      {total === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-[#7B87AB] bg-white px-6 py-10 text-center text-slate-600">
          Lessons for this topic are on their way.
        </p>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">
          {/* Progress and module jump list. First in the DOM so it leads on mobile. */}
          <aside
            aria-labelledby="progress-heading"
            className="rounded-3xl border border-[#D5DBEE] bg-white p-6 lg:sticky lg:top-32 lg:col-start-2 lg:row-start-1 lg:self-start"
          >
            <h2
              id="progress-heading"
              className={`${DISPLAY} text-lg font-semibold`}
            >
              Your progress
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              <span
                className={`${DISPLAY} text-3xl font-semibold text-[#0F1B3D]`}
              >
                {done}
              </span>{" "}
              of {total} topics complete
            </p>
            <div className="mt-3">
              <ProgressBar value={percent} label={`${topic.label} progress`} />
            </div>

            {next && (
              <Link
                href={lessonHref(next)}
                className={`${BTN_PRIMARY} mt-5 w-full`}
              >
                Continue with Lesson {next.number}
              </Link>
            )}

            <nav
              aria-label={`${topic.label} modules`}
              className="mt-6 hidden border-t border-[#E3E7F4] pt-5 lg:block"
            >
              <h3 className="text-sm font-semibold">Jump to module</h3>
              <ul className="mt-3 space-y-1">
                {modules.map((m, i) => (
                  <li key={m.title}>
                    <a
                      href={`#module-${i + 1}`}
                      className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm hover:bg-[#EEF1FA] ${FOCUS}`}
                    >
                      <span>{m.title}</span>
                      <span className="text-slate-500">
                        {moduleDone(m)}/{m.lessons.length}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* The topics, grouped by module */}
          <div className="space-y-10 lg:col-start-1 lg:row-start-1">
            {modules.map((m, i) => (
              <section
                key={m.title}
                id={`module-${i + 1}`}
                aria-labelledby={`module-${i + 1}-heading`}
                className="scroll-mt-36"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h2
                    id={`module-${i + 1}-heading`}
                    className={`${DISPLAY} text-xl font-semibold tracking-tight`}
                  >
                    Module {i + 1}: {m.title}
                  </h2>
                  <p className="text-sm text-slate-600">
                    {moduleDone(m)} of {m.lessons.length} complete
                  </p>
                </div>

                <ul className="mt-4 space-y-3">
                  {m.lessons.map((lesson) => (
                    <li key={lesson.slug}>
                      <LessonRow
                        lesson={lesson}
                        status={lessonStatus(topic.slug, lesson.number)}
                        href={lessonHref(lesson)}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
