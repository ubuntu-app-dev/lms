"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import {
  LESSONS_BY_TOPIC,
  type Lesson,
  type LessonStatus,
  type TopicSlug,
} from "@/data/data";

/** Slugs of the lessons the learner has passed, per topic. */
export type CompletedLessons = Partial<Record<TopicSlug, string[]>>;

/**
 * A saved assessment. `answers` and `score` are null for lessons that were
 * marked done by hand (for example lessons you seeded as already finished).
 */
export type LessonResult = {
  score: number | null;
  answers: number[] | null;
};

type ProgressApi = {
  /** How many lessons of this topic are done */
  completedCount: (topic: TopicSlug) => number;
  /** "completed" | "current" (first unfinished lesson) | "upcoming" */
  lessonStatus: (topic: TopicSlug, lessonNumber: number) => LessonStatus;
  /** First lesson not finished yet, or undefined when the topic is complete */
  nextLesson: (topic: TopicSlug) => Lesson | undefined;
  isCompleted: (topic: TopicSlug, lessonSlug: string) => boolean;
};

const ProgressContext = createContext<ProgressApi | null>(null);

export function ProgressProvider({
  completed,
  children,
}: {
  completed: CompletedLessons;
  children: ReactNode;
}) {
  const api = useMemo<ProgressApi>(() => {
    const doneSet = (topic: TopicSlug) => new Set(completed[topic] ?? []);
    const lessonsOf = (topic: TopicSlug) => LESSONS_BY_TOPIC[topic] ?? [];

    const nextLesson = (topic: TopicSlug) => {
      const done = doneSet(topic);
      return lessonsOf(topic).find((l) => !done.has(l.slug));
    };

    return {
      // Counts only lessons that still exist, so a renamed or removed slug in
      // the database can never push the count past the total.
      completedCount: (topic) => {
        const done = doneSet(topic);
        return lessonsOf(topic).filter((l) => done.has(l.slug)).length;
      },
      lessonStatus: (topic, lessonNumber) => {
        const lesson = lessonsOf(topic).find((l) => l.number === lessonNumber);
        if (!lesson) return "upcoming";
        if (doneSet(topic).has(lesson.slug)) return "completed";
        return nextLesson(topic)?.number === lessonNumber
          ? "current"
          : "upcoming";
      },
      nextLesson,
      isCompleted: (topic, lessonSlug) => doneSet(topic).has(lessonSlug),
    };
  }, [completed]);

  return (
    <ProgressContext.Provider value={api}>{children}</ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx)
    throw new Error("useProgress must be used inside <ProgressProvider>");
  return ctx;
}
