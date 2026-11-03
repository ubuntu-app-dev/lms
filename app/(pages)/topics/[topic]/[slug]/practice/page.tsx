// app/topics/[topic]/[slug]/practice/page.tsx
import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import TopNav from "@/components/layout/TopNav";
import LessonSkeleton from "@/components/layout/LessonSkeleton";
import CodeWorkspace from "@/components/practice/CodeWorkspace";
import { OOP_COURSE } from "@/data/oopCourse";
import { OOP_EXERCISES, getExercise } from "@/data/oopExercises";
import { BASE_PATH, API_PATH, FOCUS } from "@/data/data";
import { NavigationUser } from "@/types/auth";
import { getCurrentUser } from "@/lib/supabase/current-user";

// Same fonts as the lesson page
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

export function generateStaticParams() {
  return OOP_EXERCISES.map((e) => ({ topic: "oop", slug: e.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const exercise = getExercise(slug);
  return {
    title: exercise
      ? `${exercise.title} practice | Java OOP`
      : "Practice | Java OOP",
  };
}

export default async function PracticePage({ params }: PageProps) {
  return (
    <Suspense fallback={<LessonSkeleton />}>
      <PracticePageContent params={params} />
    </Suspense>
  );
}

async function PracticePageContent({ params }: PageProps) {
  const { topic, slug } = await params;
  const user = await getCurrentUser();

  if (topic !== "oop") notFound();

  const index = OOP_COURSE.findIndex((l) => l.slug === slug);
  const exercise = getExercise(slug);
  if (index === -1 || !exercise) notFound();

  const lesson = OOP_COURSE[index];
  const next = OOP_COURSE[index + 1];
  const oopHref = `${BASE_PATH}?topics=oop`;
  const lessonHref = `/topics/oop/${lesson.slug}`;

  const navUser: NavigationUser = { ...user, unreadNotifications: 0 };

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
        className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
      >
        <nav aria-label="Breadcrumb" className="mb-5">
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
            <li>
              <Link
                href={lessonHref}
                className={`rounded font-medium text-[#2347F4] underline-offset-4 hover:underline ${FOCUS}`}
              >
                Lesson {lesson.number}: {lesson.title}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">Practice</li>
          </ol>
        </nav>

        <CodeWorkspace
          exercise={exercise}
          lessonHref={lessonHref}
          nextHref={next ? `/topics/oop/${next.slug}` : undefined}
          nextLabel={next ? `Next: ${next.title}` : undefined}
          apiUrl={`${API_PATH}/api/run-java`}
        />
      </main>
    </div>
  );
}
