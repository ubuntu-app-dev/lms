"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isEnrolled } from "@/lib/enrollment";
import { OOP_COURSE } from "@/data/oopCourse";
import { BASE_PATH, PASS_MARK, type TopicSlug } from "@/data/data";

/** Quiz material per topic. Add an entry when you unlock another topic. */
const COURSES: Partial<Record<TopicSlug, typeof OOP_COURSE>> = {
  oop: OOP_COURSE,
};

export type SubmitQuizResult =
  | {
      ok: true;
      /** null only when the lesson was already submitted earlier by hand */
      score: number | null;
      total: number;
      passed: boolean;
      /** true when this lesson had already been submitted before this call */
      alreadySubmitted: boolean;
    }
  | {
      ok: false;
      error: "not_signed_in" | "not_enrolled" | "invalid" | "save_failed";
    };

/**
 * Grades an assessment on the server and saves it. Submitting is what marks
 * the lesson as done, whatever the score, and it can only happen once per
 * student and lesson. `answers` holds the chosen option index (0 to 3) for each
 * question, in order.
 */
export async function submitQuiz(
  topic: string,
  lessonSlug: string,
  answers: number[],
): Promise<SubmitQuizResult> {
  const lesson = COURSES[topic as TopicSlug]?.find(
    (l) => l.slug === lessonSlug,
  );
  if (
    !lesson ||
    !Array.isArray(answers) ||
    answers.length !== lesson.quiz.length ||
    !answers.every((a) => Number.isInteger(a) && a >= 0 && a <= 3)
  ) {
    return { ok: false, error: "invalid" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "not_signed_in" };
  if (!(await isEnrolled())) return { ok: false, error: "not_enrolled" };

  const total = lesson.quiz.length;
  const score = lesson.quiz.reduce(
    (n, q, i) => (answers[i] === q.answer ? n + 1 : n),
    0,
  );

  // The primary key (user, topic, lesson) makes a second insert fail, so even
  // two tabs submitting at once can't create a second attempt.
  const { error } = await createAdminClient().from("lesson_progress").insert({
    user_id: user.id,
    topic,
    lesson_slug: lessonSlug,
    score,
    answers,
  });

  if (error) {
    if (error.code !== "23505") return { ok: false, error: "save_failed" };

    // Already submitted before: report the saved score, never overwrite it.
    const { data: existing } = await supabase
      .from("lesson_progress")
      .select("score")
      .eq("topic", topic)
      .eq("lesson_slug", lessonSlug)
      .maybeSingle();
    const saved: number | null = existing?.score ?? null;
    return {
      ok: true,
      score: saved,
      total,
      passed: (saved ?? 0) >= PASS_MARK,
      alreadySubmitted: true,
    };
  }

  revalidatePath(BASE_PATH);
  revalidatePath("/topics", "layout");
  return {
    ok: true,
    score,
    total,
    passed: score >= PASS_MARK,
    alreadySubmitted: false,
  };
}
