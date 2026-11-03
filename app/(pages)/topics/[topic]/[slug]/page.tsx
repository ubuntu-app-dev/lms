import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import { Icon } from "@/components/icon/Icon";
import TopNav from "@/components/layout/TopNav";
import LessonContent from "@/components/lesson/LessonContent";
import LessonSidebar from "@/components/layout/LessonSidebar";
import LessonPager, { CompactPager } from "@/components/layout/LessonPager";
import Quiz from "@/components/lesson/Quiz";
import Inline from "@/components/lesson/Inline";
import { LESSON_ICONS } from "@/components/icon/Icon";
import { OOP_COURSE } from "@/data/oopCourse";
import { BASE_PATH, DISPLAY, FOCUS, USER } from "@/data/data";
import { NavigationUser } from "@/types/auth";
import { getCurrentUser } from "@/lib/supabase/current-user";
import LessonSkeleton from "@/components/layout/LessonSkeleton";
import PracticeCta from "@/components/practice/PracticeCta";
import { getExercise } from "@/data/oopExercises";

// Same fonts as the other pages
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});
const body = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
});

type PageProps = { params: Promise<{ topic: string; slug: string }> };

// Only the Java OOP topic has lessons for now. Other topics are locked.
export function generateStaticParams() {
  return OOP_COURSE.map((lesson) => ({ topic: "oop", slug: lesson.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const lesson = OOP_COURSE.find((l) => l.slug === slug);
  return { title: lesson ? `${lesson.title} | Java OOP` : "Java OOP" };
}

export default async function LessonPage({ params }: PageProps) {
  return (
    <Suspense fallback={<LessonSkeleton />}>
      <LessonPageContent params={params} />
    </Suspense>
  );
}

async function LessonPageContent({ params }: PageProps) {
  const { topic, slug } = await params;
  const user = await getCurrentUser();

  if (topic !== "oop") notFound();

  const index = OOP_COURSE.findIndex((l) => l.slug === slug);
  if (index === -1) notFound();

  const lesson = OOP_COURSE[index];
  const prev = OOP_COURSE[index - 1];
  const next = OOP_COURSE[index + 1];
  const oopHref = `${BASE_PATH}?topics=oop`;

  const navUser: NavigationUser = {
    ...user,
    unreadNotifications: 0,
  };

  const exercise = getExercise(lesson.slug);

  return (
    <div
      className={`${body.className} ${display.variable} min-h-screen bg-[#F2F4FB] text-[#0F1B3D]`}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:shadow-lg"
      >
        Skip to content
      </a>

      <TopNav active={"oop"} user={navUser} navUser={navUser} />

      <main
        id="main"
        className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10"
      >
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-10">
          <LessonSidebar items={OOP_COURSE} currentSlug={lesson.slug} />

          <article className="min-w-0 rounded-3xl border border-[#D5DBEE] bg-white p-6 sm:p-10">
            {/* Breadcrumb and quick prev/next */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <nav aria-label="Breadcrumb">
                <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-600">
                  <li>
                    <Link
                      href={oopHref}
                      className={`rounded font-medium text-[#2347F4] underline-offset-4 hover:underline ${FOCUS}`}
                    >
                      Java OOP
                    </Link>
                  </li>
                  <li aria-hidden="true">/</li>
                  <li>{lesson.module}</li>
                  <li aria-hidden="true">/</li>
                  <li aria-current="page">Lesson {lesson.number}</li>
                </ol>
              </nav>
              <CompactPager prev={prev} next={next} />
            </div>

            <h1
              className={`${DISPLAY} mt-6 text-3xl font-semibold tracking-tight sm:text-4xl`}
            >
              {lesson.title}
            </h1>
            <p className="mt-2 text-lg text-slate-600">{lesson.summary}</p>

            <p className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <Icon path={LESSON_ICONS.clock} className="h-4 w-4" />
                {lesson.minutes} min with assessment
              </span>
              <a
                href="#assessment"
                className={`rounded font-medium text-[#2347F4] underline-offset-4 hover:underline ${FOCUS}`}
              >
                Jump to the assessment
              </a>
            </p>

            <div className="mt-2 border-t border-[#E3E7F4]">
              <LessonContent blocks={lesson.content} />
            </div>

            {/* Key takeaways */}
            <section
              aria-labelledby="takeaways-heading"
              className="mt-10 rounded-2xl bg-[#F2F4FB] p-5 sm:p-6"
            >
              <h2
                id="takeaways-heading"
                className={`${DISPLAY} text-lg font-semibold tracking-tight`}
              >
                Key takeaways
              </h2>
              <ul className="mt-3 space-y-2.5">
                {lesson.takeaways.map((item, i) => (
                  <li key={i} className="flex gap-3 leading-7 text-slate-700">
                    <span
                      aria-hidden="true"
                      className="mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FFD84A] text-[#0F1B3D]"
                    >
                      <Icon path={LESSON_ICONS.check} className="h-3 w-3" />
                    </span>
                    <span className="min-w-0">
                      <Inline text={item} />
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            {exercise && (
              <PracticeCta
                href={`/topics/oop/${lesson.slug}/practice`}
                exercise={exercise}
              />
            )}
            {/* Assessment */}
            <Quiz
              key={lesson.slug}
              questions={lesson.quiz}
              topic="oop"
              lessonSlug={lesson.slug}
              nextHref={next ? `/topics/oop/${next.slug}` : oopHref}
              nextLabel={next ? `Next: ${next.title}` : "Back to Java OOP"}
            />

            <LessonPager prev={prev} next={next} />
          </article>
        </div>
      </main>
    </div>
  );
}
