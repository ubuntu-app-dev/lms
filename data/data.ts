import type { CSSProperties } from "react";
import { ICONS } from "@/components/icon/Icon";
import { OOP_COURSE } from "./oopCourse";
export const PASS_MARK = 4;
/* -------------------------------------------------------------------------- */
/*  Shared constants                                                           */
/* -------------------------------------------------------------------------- */

export const BRAND = "LMS";
export const BASE_PATH = "/student";
export const API_PATH = "http://localhost:3000/";

// Needs the --font-display variable set on the page wrapper
export const DISPLAY = "font-[family-name:var(--font-display)]";

export const FOCUS =
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2347F4]/25";

export const BTN_PRIMARY = `inline-flex items-center justify-center gap-2 rounded-xl bg-[#2347F4] px-5 py-3 text-center text-base font-semibold text-white transition-colors hover:bg-[#1B38C9] motion-reduce:transition-none ${FOCUS}`;

export const BTN_SECONDARY = `inline-flex items-center justify-center gap-2 rounded-xl border border-[#7B87AB] px-5 py-3 text-center text-base font-semibold text-[#0F1B3D] transition-colors hover:border-[#4A5883] hover:bg-white motion-reduce:transition-none ${FOCUS}`;

export const GRID_BG: CSSProperties = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px)",
  backgroundSize: "32px 32px",
};

/** Copy shown on the lock page. Edit freely. */
export const LOCKED_COPY = {
  body: "This topic isn't open yet. Start with Java OOP, then come back here.",
};

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export type TopicSlug = "oop" | "htmlcss" | "javascript" | "php" | "database";

/** "all" is the Overview tab in the navbar */
export type TopicFilter = TopicSlug | "all";

export type Topic = {
  slug: TopicSlug;
  label: string;
  description: string;
  icon: string;
  /** Tailwind classes for the colored icon tile */
  tile: string;
  /** Locked topics show the lock page instead of lessons */
  locked: boolean;
};

export type NavItem = {
  slug: TopicFilter;
  label: string;
  icon: string;
  locked: boolean;
  /** Number of lessons, shown as a badge on unlocked topics */
  count?: number;
};

export type Lesson = {
  number: number;
  slug: string;
  title: string;
  summary: string;
  minutes: number;
  module: string;
};

export type LessonStatus = "completed" | "current" | "upcoming";

export type User = {
  name: string;
  subscription: "active" | "pending";
  unreadNotifications: number;
};

/* -------------------------------------------------------------------------- */
/*  Topics                                                                     */
/*  To unlock a topic: set locked to false and add its lessons below.          */
/* -------------------------------------------------------------------------- */

export const TOPICS: Topic[] = [
  {
    slug: "oop",
    label: "Java OOP",
    description:
      "Java basics and the four pillars of object-oriented programming: encapsulation, inheritance, polymorphism, and abstraction.",
    icon: ICONS.coffee,
    tile: "bg-[#E4EAFF] text-[#2347F4]",
    locked: false,
  },
  {
    slug: "htmlcss",
    label: "HTML & CSS",
    description: "Build and style web pages with HTML and CSS.",
    icon: ICONS.code,
    tile: "bg-[#FFE2DE] text-[#A8281B]",
    locked: true,
  },
  {
    slug: "javascript",
    label: "JavaScript",
    description: "Make pages interactive with JavaScript.",
    icon: ICONS.braces,
    tile: "bg-[#FFEFC7] text-[#7A5200]",
    locked: true,
  },
  {
    slug: "php",
    label: "PHP",
    description: "Write server-side code with PHP.",
    icon: ICONS.terminal,
    tile: "bg-[#EBE3FF] text-[#5530BF]",
    locked: true,
  },
  {
    slug: "database",
    label: "Database",
    description: "Design and query databases with SQL.",
    icon: ICONS.database,
    tile: "bg-[#DDF3E8] text-[#0B6B42]",
    locked: true,
  },
];

export const EXTRA_LINKS = [
  {
    page: "workspace",
    label: "Workspace",
    href: `${BASE_PATH}/workspace`,
    icon: ICONS.terminal,
  },
  {
    page: "submissions",
    label: "Submissions",
    href: `${BASE_PATH}/submissions`,
    icon: ICONS.code,
  },
] as const;

export const TOPIC_BY_SLUG = Object.fromEntries(
  TOPICS.map((t) => [t.slug, t]),
) as Record<TopicSlug, Topic>;

/* -------------------------------------------------------------------------- */
/*  Java OOP lessons                                                           */
/*  The full material (content + assessments) lives in ./oopCourse.ts.         */
/*  This is the lightweight list the OOP page and navbar need.                 */
/* -------------------------------------------------------------------------- */

export const OOP_LESSONS: Lesson[] = OOP_COURSE.map(
  ({ number, slug, title, summary, minutes, module }) => ({
    number,
    slug,
    title,
    summary,
    minutes,
    module,
  }),
);

/** Lessons for each unlocked topic. Add an entry when you unlock another topic. */
export const LESSONS_BY_TOPIC: Partial<Record<TopicSlug, Lesson[]>> = {
  oop: OOP_LESSONS,
};

/* -------------------------------------------------------------------------- */
/*  Navbar items (built from the topics above)                                 */
/* -------------------------------------------------------------------------- */

export const NAV_ITEMS: NavItem[] = [
  { slug: "all", label: "Overview", icon: ICONS.grid, locked: false },
  ...TOPICS.map(
    (t): NavItem => ({
      slug: t.slug,
      label: t.label,
      icon: t.icon,
      locked: t.locked,
      count: t.locked ? undefined : LESSONS_BY_TOPIC[t.slug]?.length,
    }),
  ),
];

/** Reads ?topic= from the URL and falls back to "all" for anything unknown. */
export function parseTopic(value: string | null): TopicFilter {
  return NAV_ITEMS.some((t) => t.slug === value)
    ? (value as TopicFilter)
    : "all";
}

/* -------------------------------------------------------------------------- */
/*  Mock data: replace each of these with data from your API / database        */
/* -------------------------------------------------------------------------- */

export const USER: User = {
  name: "Alex Rivera",
  subscription: "active", // set to "pending" to preview the verification banner
  unreadNotifications: 2,
};

/** How many lessons the learner has completed in each topic (in order). */
export const PROGRESS: Partial<Record<TopicSlug, number>> = {
  oop: 8,
};

/** Which topic the "Continue learning" card on the Overview points to. */
export const CONTINUE_TOPIC: TopicSlug = "oop";

// `today` should come from your server so it matches the learner's day.
export const WEEK: { day: string; minutes: number; today?: boolean }[] = [
  { day: "Mon", minutes: 35 },
  { day: "Tue", minutes: 50 },
  { day: "Wed", minutes: 0 },
  { day: "Thu", minutes: 65, today: true },
  { day: "Fri", minutes: 40 },
  { day: "Sat", minutes: 15 },
  { day: "Sun", minutes: 0 },
];

export const DUE: { title: string; course: string; due: string }[] = [
  {
    title: "Assessment: Attributes, Methods and static",
    course: "Java OOP",
    due: "Tomorrow",
  },
  { title: "Assessment: Constructors", course: "Java OOP", due: "Fri" },
  { title: "Assessment: Access Modifiers", course: "Java OOP", due: "Mon" },
];

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

export function completedCount(topic: TopicSlug) {
  return PROGRESS[topic] ?? 0;
}

export function lessonStatus(
  topic: TopicSlug,
  lessonNumber: number,
): LessonStatus {
  const done = completedCount(topic);
  if (lessonNumber <= done) return "completed";
  if (lessonNumber === done + 1) return "current";
  return "upcoming";
}

export function nextLesson(topic: TopicSlug): Lesson | undefined {
  const lessons = LESSONS_BY_TOPIC[topic] ?? [];
  return lessons.find((l) => l.number === completedCount(topic) + 1);
}
