import type { CSSProperties } from "react";
import { ICONS } from "@/components/icon/Icon";

/* -------------------------------------------------------------------------- */
/*  Shared constants                                                           */
/* -------------------------------------------------------------------------- */

export const BRAND = "LMS";
export const BASE_PATH = "/dashboard";

// Needs the --font-display variable set in app/dashboard/page.tsx
export const DISPLAY = "font-[family-name:var(--font-display)]";

export const GRID_BG: CSSProperties = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px)",
  backgroundSize: "32px 32px",
};

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export type TopicSlug = "oop" | "htmlcss" | "javascript" | "php" | "database";

export type TopicFilter = TopicSlug | "all";

export type Topic = {
  slug: TopicSlug;
  label: string;
  icon: string;
  /** Tailwind classes for the small colored tile on course cards */
  tile: string;
};

export type NavItem = { slug: TopicFilter; label: string; icon: string };

export type Course = {
  slug: string;
  title: string;
  topic: TopicSlug;
  instructor: string;
  lessons: number;
  minutes: number;
  /** 0 = not started, 100 = completed */
  progress: number;
};

export type User = {
  name: string;
  subscription: "active" | "pending";
  unreadNotifications: number;
};

/* -------------------------------------------------------------------------- */
/*  Topics (these drive the navbar)                                            */
/* -------------------------------------------------------------------------- */

export const TOPICS: Topic[] = [
  {
    slug: "oop",
    label: "Object-Oriented Programming",
    icon: ICONS.coffee,
    tile: "bg-[#E4EAFF] text-[#2347F4]",
  },
  {
    slug: "htmlcss",
    label: "HTML & CSS",
    icon: ICONS.code,
    tile: "bg-[#DDF3E8] text-[#0B6B42]",
  },
  {
    slug: "javascript",
    label: "JavaScript",
    icon: ICONS.code,
    tile: "bg-[#FFE2DE] text-[#A8281B]",
  },
  {
    slug: "php",
    label: "PHP",
    icon: ICONS.code,
    tile: "bg-[#EBE3FF] text-[#5530BF]",
  },
  {
    slug: "database",
    label: "Database",
    icon: ICONS.database,
    tile: "bg-[#FFE2DE] text-[#A8281B]",
  },
];

export const TOPIC_BY_SLUG = Object.fromEntries(
  TOPICS.map((t) => [t.slug, t]),
) as Record<TopicSlug, Topic>;

export const NAV_ITEMS: NavItem[] = [
  { slug: "all", label: "All topics", icon: ICONS.grid },
  ...TOPICS,
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

export const COURSES: Course[] = [
  {
    slug: "calculus-essentials",
    title: "Calculus Essentials",
    topic: "oop",
    instructor: "Prof. Lena Hoffmann",
    lessons: 24,
    minutes: 380,
    progress: 62,
  },
  {
    slug: "statistics-for-beginners",
    title: "Statistics for Beginners",
    topic: "htmlcss",
    instructor: "Dr. Sam Adeyemi",
    lessons: 18,
    minutes: 260,
    progress: 0,
  },
  {
    slug: "introduction-to-chemistry",
    title: "Introduction to Chemistry",
    topic: "javascript",
    instructor: "Dr. Priya Nair",
    lessons: 20,
    minutes: 340,
    progress: 35,
  },
  {
    slug: "physics-motion-and-forces",
    title: "Physics: Motion and Forces",
    topic: "database",
    instructor: "Prof. Tomás Herrera",
    lessons: 16,
    minutes: 240,
    progress: 100,
  },
  {
    slug: "academic-writing",
    title: "Academic Writing",
    topic: "database",
    instructor: "Chloe Bennett",
    lessons: 12,
    minutes: 180,
    progress: 0,
  },
  {
    slug: "conversational-spanish",
    title: "Conversational Spanish",
    topic: "database",
    instructor: "Marta Silva",
    lessons: 30,
    minutes: 450,
    progress: 12,
  },
  {
    slug: "web-development-basics",
    title: "Web Development Basics",
    topic: "database",
    instructor: "Jordan Lee",
    lessons: 28,
    minutes: 520,
    progress: 48,
  },
  {
    slug: "python-fundamentals",
    title: "Python Fundamentals",
    topic: "database",
    instructor: "Aisha Rahman",
    lessons: 22,
    minutes: 400,
    progress: 0,
  },
  {
    slug: "data-structures-in-practice",
    title: "Data Structures in Practice",
    topic: "database",
    instructor: "Kenji Watanabe",
    lessons: 26,
    minutes: 480,
    progress: 0,
  },
  {
    slug: "web-design-principles",
    title: "Web Design Principles",
    topic: "htmlcss",
    instructor: "Rachel Cohen",
    lessons: 10,
    minutes: 150,
    progress: 80,
  },
  {
    slug: "introduction-to-javascript",
    title: "Introduction to JavaScript",
    topic: "javascript",
    instructor: "Aisha Rahman",
    lessons: 22,
    minutes: 400,
    progress: 0,
  },
];

export const CONTINUE = {
  courseSlug: "calculus-essentials",
  lessonNumber: 14,
  lessonTitle: "Integration by parts",
  minutesLeft: 12,
};

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
    title: "Quiz: Limits and continuity",
    course: "Calculus Essentials",
    due: "Tomorrow",
  },
  { title: "Lab report 2", course: "Introduction to Chemistry", due: "Fri" },
  {
    title: "Draft: Email to a client",
    course: "Business Communication",
    due: "Mon",
  },
];

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

export const COUNTS = NAV_ITEMS.reduce(
  (acc, item) => {
    acc[item.slug] =
      item.slug === "all"
        ? COURSES.length
        : COURSES.filter((c) => c.topic === item.slug).length;
    return acc;
  },
  {} as Record<TopicFilter, number>,
);

export function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}
