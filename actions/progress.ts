import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { TopicSlug } from "@/data/data";
import type {
  CompletedLessons,
  LessonResult,
} from "@/components/progress/ProgressProvider";

/**
 * Lessons the signed-in student has finished, per topic. Row level security
 * limits the query to their own rows, so no user id filter is needed.
 * Returns an empty object when signed out or if the query fails.
 */
export async function getCompletedLessons(): Promise<CompletedLessons> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lesson_progress")
    .select("topic, lesson_slug");

  if (error || !data) return {};

  const completed: CompletedLessons = {};
  for (const row of data) {
    const topic = row.topic as TopicSlug;
    (completed[topic] ??= []).push(row.lesson_slug);
  }
  return completed;
}

/**
 * The student's saved assessment for one lesson, or null when they haven't
 * taken it yet. The lesson page passes this to <Quiz> so a finished
 * assessment opens locked, showing the saved result.
 */
export async function getLessonResult(
  topic: TopicSlug,
  lessonSlug: string,
): Promise<LessonResult | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lesson_progress")
    .select("score, answers")
    .eq("topic", topic)
    .eq("lesson_slug", lessonSlug)
    .maybeSingle();

  if (!data) return null;
  return { score: data.score, answers: data.answers };
}
