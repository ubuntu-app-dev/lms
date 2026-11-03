import Link from "next/link";
import { Icon } from "@/components/icon/Icon";
import { FOCUS } from "@/data/data";
import { LESSON_ICONS } from "@/components/icon/Icon";

type Target = { slug: string; title: string; number: number };

const href = (t: Target) => `/topics/oop/${t.slug}`;

/** Small prev/next links shown next to the breadcrumb */
export function CompactPager({ prev, next }: { prev?: Target; next?: Target }) {
  const link = `inline-flex items-center gap-1.5 rounded-lg border border-[#D5DBEE] bg-white px-3 py-1.5 text-sm font-medium hover:border-[#2347F4] ${FOCUS}`;
  return (
    <nav aria-label="Lesson navigation, top" className="flex gap-2">
      {prev && (
        <Link href={href(prev)} className={link}>
          <Icon path={LESSON_ICONS.arrowLeft} className="h-4 w-4" />
          Previous
        </Link>
      )}
      {next && (
        <Link href={href(next)} className={link}>
          Next
          <Icon path={LESSON_ICONS.arrowRight} className="h-4 w-4" />
        </Link>
      )}
    </nav>
  );
}

/** Large prev/next cards shown under the assessment */
export default function LessonPager({
  prev,
  next,
}: {
  prev?: Target;
  next?: Target;
}) {
  const card = `group flex h-full flex-col rounded-2xl border border-[#D5DBEE] bg-white p-4 transition-colors hover:border-[#2347F4] motion-reduce:transition-none ${FOCUS}`;
  return (
    <nav
      aria-label="Lesson navigation, bottom"
      className="mt-10 grid gap-3 border-t border-[#E3E7F4] pt-8 sm:grid-cols-2"
    >
      {prev ? (
        <Link href={href(prev)} className={card}>
          <span className="flex items-center gap-1.5 text-sm text-slate-600">
            <Icon path={LESSON_ICONS.arrowLeft} className="h-4 w-4" />
            Previous
          </span>
          <span className="mt-1 font-semibold">{prev.title}</span>
        </Link>
      ) : (
        <span className="hidden sm:block" />
      )}

      {next && (
        <Link
          href={href(next)}
          className={`${card} sm:items-end sm:text-right`}
        >
          <span className="flex items-center gap-1.5 text-sm text-slate-600">
            Next
            <Icon path={LESSON_ICONS.arrowRight} className="h-4 w-4" />
          </span>
          <span className="mt-1 font-semibold">{next.title}</span>
        </Link>
      )}
    </nav>
  );
}
